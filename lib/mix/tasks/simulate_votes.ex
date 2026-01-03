defmodule Mix.Tasks.SimulateVotes do
  @moduledoc """
  Mix task to simulate random votes from random users on a specific session.

  ## Usage

      mix simulate_votes SESSION_ID [OPTIONS]

  ## Options

      --users COUNT        Number of random users to create (default: 10)
      --votes-per-user N   Max number of votes per user (default: 3)
      --min-votes N        Min number of votes per user (default: 1)

  ## Examples

      # Simulate 10 users with 1-3 votes each
      mix simulate_votes 01234567-89ab-cdef-0123-456789abcdef

      # Simulate 20 users with 1-5 votes each
      mix simulate_votes 01234567-89ab-cdef-0123-456789abcdef --users 20 --votes-per-user 5

      # Simulate 5 users with exactly 2 votes each
      mix simulate_votes 01234567-89ab-cdef-0123-456789abcdef --users 5 --min-votes 2 --votes-per-user 2
  """

  use Mix.Task
  import Ecto.Query
  alias FoodCaptain.{Repo, Accounts, Sessions}
  alias FoodCaptain.Accounts.Scope
  alias FoodCaptain.Sessions.{Session, Option, Vote}

  @shortdoc "Simulate random votes from random users on a session"

  def run(args) do
    Mix.Task.run("app.start")

    {opts, [session_id], _} = OptionParser.parse(args,
      strict: [
        users: :integer,
        votes_per_user: :integer,
        min_votes: :integer
      ]
    )

    users_count = Keyword.get(opts, :users, 10)
    max_votes_per_user = Keyword.get(opts, :votes_per_user, 3)
    min_votes_per_user = Keyword.get(opts, :min_votes, 1)

    case validate_and_get_session(session_id) do
      {:ok, session} ->
        simulate_votes(session, users_count, min_votes_per_user, max_votes_per_user)
      {:error, reason} ->
        Mix.shell().error("Error: #{reason}")
        System.halt(1)
    end
  end

  defp validate_and_get_session(session_id) do
    case Sessions.get_session(session_id) do
      nil ->
        {:error, "Session not found with ID: #{session_id}"}

      %Session{state: :closed} = session ->
        {:error, "Cannot vote on closed session: #{session.name}"}

      %Session{state: :open} = session ->
        session_with_options = Repo.preload(session, :options)

        case session_with_options.options do
          [] ->
            {:error, "Session has no options to vote on"}
          options when length(options) < 2 ->
            {:error, "Session needs at least 2 options for meaningful voting"}
          _ ->
            {:ok, session_with_options}
        end
    end
  end

  defp simulate_votes(session, users_count, min_votes, max_votes) do
    Mix.shell().info("Simulating votes for session: #{session.name}")
    Mix.shell().info("Options available: #{length(session.options)}")
    Mix.shell().info("Creating #{users_count} random users...")

    # Create random users
    users = create_random_users(users_count)

    Mix.shell().info("Generating random votes...")

    # Generate votes for each user
    Enum.each(users, fn user ->
      vote_count = Enum.random(min_votes..max_votes)
      vote_count = min(vote_count, length(session.options)) # Can't vote for more options than exist

      create_user_votes(user, session, vote_count)
    end)

    # Show results
    show_voting_summary(session.id)
  end

  defp create_random_users(count) do
    Enum.map(1..count, fn i ->
      email = "simuser#{i}_#{:rand.uniform(999999)}@example.com"

      case Accounts.register_user(%{
        email: email,
        password: "password123456",
        password_confirmation: "password123456"
      }) do
        {:ok, user} ->
          Mix.shell().info("Created user: #{user.email}")
          user
        {:error, changeset} ->
          Mix.shell().error("Failed to create user #{email}: #{inspect(changeset.errors)}")
          nil
      end
    end)
    |> Enum.reject(&is_nil/1)
  end

  defp create_user_votes(user, session, vote_count) do
    # Randomly select options to vote for
    selected_options =
      session.options
      |> Enum.shuffle()
      |> Enum.take(vote_count)

    # Create votes data with sequential ranks
    votes_data =
      selected_options
      |> Enum.with_index(1)
      |> Enum.map(fn {option, rank} ->
        %{
          rank: rank,
          option_id: option.id
        }
      end)

    # Create scope for the user
    scope = Scope.for_user(user)

    # Use the Sessions context to create votes
    case Sessions.update_session_votes(scope, session.id, votes_data) do
      {:ok, _votes} ->
        option_names = Enum.map(selected_options, & &1.name)
        Mix.shell().info("  #{user.email}: #{Enum.join(option_names, " > ")}")

      {:error, changeset} ->
        Mix.shell().error("  #{user.email}: Failed to create votes - #{inspect(changeset.errors)}")
    end
  end

  defp show_voting_summary(session_id) do
    # Get vote counts per option
    vote_counts =
      from(v in Vote,
        join: o in Option, on: v.option_id == o.id,
        where: v.session_id == ^session_id,
        group_by: [o.id, o.name],
        select: {o.name, count(v.id)},
        order_by: [desc: count(v.id)]
      )
      |> Repo.all()

    # Get total users who voted
    total_voters =
      from(v in Vote,
        where: v.session_id == ^session_id,
        select: count(v.user_id, :distinct)
      )
      |> Repo.one()

    Mix.shell().info("\n=== Voting Summary ===")
    Mix.shell().info("Total voters: #{total_voters}")
    Mix.shell().info("Vote counts by option:")

    Enum.each(vote_counts, fn {option_name, count} ->
      Mix.shell().info("  #{option_name}: #{count} votes")
    end)

    Mix.shell().info("\nSimulation complete! 🎉")
  end
end
