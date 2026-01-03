defmodule FoodCaptain.Sessions.RankedChoiceVoting do
  @moduledoc """
  Utility module for calculating ranked choice voting results.

  This module operates on provided data structures and does not perform database queries,
  making it suitable for testing with in-memory data.
  """

  alias FoodCaptain.Sessions.Session

  @doc """
  Calculates ranked choice voting results from session data.

  ## Parameters

  - `session`: A Session struct with preloaded votes and options

  ## Returns

  A map containing the complete ranked choice voting results including all rounds
  and the final winner or tie information.
  """
  def calculate_results(%Session{} = session) do
    option_names = Map.new(session.options, fn option -> {option.id, option.name} end)
    user_ballots = build_user_ballots(session.votes)
    rounds = run_ranked_choice_rounds(user_ballots, option_names)

    %{
      session_id: session.id,
      session_name: session.name,
      total_voters: map_size(user_ballots),
      total_options: length(session.options),
      options: option_names,
      rounds: rounds,
      winner: get_winner_from_rounds(rounds)
    }
  end

  @doc """
  Builds user ballots from a list of votes.

  Groups votes by user and sorts them by rank to create ordered preference lists.
  Returns a map where keys are user IDs and values are lists of option IDs in rank order.
  """
  def build_user_ballots(votes) when is_list(votes) do
    votes
    |> Enum.group_by(& &1.user_id)
    |> Enum.map(fn {user_id, user_votes} ->
      ranked_options =
        user_votes
        |> Enum.sort_by(& &1.rank)
        |> Enum.map(& &1.option_id)

      {user_id, ranked_options}
    end)
    |> Map.new()
  end

  @doc """
  Runs the complete ranked choice voting algorithm.

  Takes user ballots and option names, returns a list of round results showing
  the elimination process and final winner.
  """
  def run_ranked_choice_rounds(user_ballots, option_names) do
    active_options = Map.keys(option_names)
    run_rounds(user_ballots, active_options, option_names, [], 1)
  end

  defp run_rounds(user_ballots, active_options, option_names, rounds_acc, round_number) do
    if Enum.empty?(active_options) do
      rounds_acc
    else
      vote_counts = count_first_choice_votes(user_ballots, active_options)
      total_votes = Enum.sum(Map.values(vote_counts))
      majority_threshold = div(total_votes, 2) + 1

      round_summary = %{
        round: round_number,
        vote_counts: vote_counts,
        total_votes: total_votes,
        majority_threshold: majority_threshold,
        eliminated: nil,
        winner: nil
      }

      case find_majority_winner(vote_counts, majority_threshold) do
        {:winner, winner_option, winner_count} ->
          final_round = %{
            round_summary
            | winner: %{
                option_id: winner_option,
                option_name: Map.get(option_names, winner_option),
                vote_count: winner_count
              }
          }

          rounds_acc ++ [final_round]

        :no_majority ->
          handle_no_majority(
            user_ballots,
            active_options,
            option_names,
            vote_counts,
            round_summary,
            rounds_acc,
            round_number
          )
      end
    end
  end

  defp find_majority_winner(vote_counts, majority_threshold) do
    case Enum.find(vote_counts, fn {_option, count} -> count >= majority_threshold end) do
      {winner_option, winner_count} -> {:winner, winner_option, winner_count}
      nil -> :no_majority
    end
  end

  defp handle_no_majority(
         user_ballots,
         active_options,
         option_names,
         vote_counts,
         round_summary,
         rounds_acc,
         round_number
       ) do
    if length(active_options) <= 2 do
      handle_final_round(vote_counts, option_names, round_summary, rounds_acc)
    else
      handle_elimination_round(
        user_ballots,
        active_options,
        option_names,
        vote_counts,
        round_summary,
        rounds_acc,
        round_number
      )
    end
  end

  defp handle_final_round(vote_counts, option_names, round_summary, rounds_acc) do
    vote_counts_list = Map.to_list(vote_counts)

    if Enum.empty?(vote_counts_list) do
      rounds_acc
    else
      max_votes = vote_counts_list |> Enum.map(fn {_, count} -> count end) |> Enum.max()
      winners = Enum.filter(vote_counts_list, fn {_, count} -> count == max_votes end)

      case winners do
        [{winner_option, winner_count}] ->
          final_round = %{
            round_summary
            | winner: %{
                option_id: winner_option,
                option_name: Map.get(option_names, winner_option),
                vote_count: winner_count
              }
          }

          rounds_acc ++ [final_round]

        multiple_winners ->
          final_round = %{
            round_summary
            | winner: %{
                tied_winners:
                  Enum.map(multiple_winners, fn {option_id, vote_count} ->
                    %{
                      option_id: option_id,
                      option_name: Map.get(option_names, option_id),
                      vote_count: vote_count
                    }
                  end)
              }
          }

          rounds_acc ++ [final_round]
      end
    end
  end

  defp handle_elimination_round(
         user_ballots,
         active_options,
         option_names,
         vote_counts,
         round_summary,
         rounds_acc,
         round_number
       ) do
    vote_count_values = Map.values(vote_counts)

    if Enum.empty?(vote_count_values) do
      rounds_acc
    else
      min_votes = Enum.min(vote_count_values)
      max_votes = Enum.max(vote_count_values)

      if min_votes == max_votes do
        handle_complete_tie(vote_counts, option_names, round_summary, rounds_acc)
      else
        eliminate_and_continue(
          user_ballots,
          active_options,
          option_names,
          vote_counts,
          min_votes,
          round_summary,
          rounds_acc,
          round_number
        )
      end
    end
  end

  defp handle_complete_tie(vote_counts, option_names, round_summary, rounds_acc) do
    tied_options = Map.to_list(vote_counts)

    final_round = %{
      round_summary
      | winner: %{
          tied_winners:
            Enum.map(tied_options, fn {option_id, vote_count} ->
              %{
                option_id: option_id,
                option_name: Map.get(option_names, option_id),
                vote_count: vote_count
              }
            end)
        }
    }

    rounds_acc ++ [final_round]
  end

  defp eliminate_and_continue(
         user_ballots,
         active_options,
         option_names,
         vote_counts,
         min_votes,
         round_summary,
         rounds_acc,
         round_number
       ) do
    options_with_min_votes =
      vote_counts
      |> Enum.filter(fn {_, count} -> count == min_votes end)
      |> Enum.map(fn {option_id, _} -> option_id end)

    eliminated_options = options_with_min_votes

    updated_ballots =
      Map.new(user_ballots, fn {user_id, ballot} ->
        {user_id, Enum.reject(ballot, fn option -> option in eliminated_options end)}
      end)

    remaining_options =
      Enum.reject(active_options, fn option -> option in eliminated_options end)

    elimination_round = %{
      round_summary
      | eliminated: %{
          eliminated_options:
            Enum.map(eliminated_options, fn option_id ->
              %{
                option_id: option_id,
                option_name: Map.get(option_names, option_id)
              }
            end),
          tied_for_last: length(eliminated_options) > 1
        }
    }

    run_rounds(
      updated_ballots,
      remaining_options,
      option_names,
      rounds_acc ++ [elimination_round],
      round_number + 1
    )
  end

  @doc """
  Counts first choice votes for active options.

  For each user's ballot, finds their highest-ranked option that is still active
  and counts it as a vote for that option. Returns a map of option_id to vote count.
  """
  def count_first_choice_votes(user_ballots, active_options) do
    initial_counts = Map.new(active_options, fn option -> {option, 0} end)

    Enum.reduce(user_ballots, initial_counts, fn {_user_id, ballot}, acc ->
      case Enum.find(ballot, fn option -> option in active_options end) do
        nil -> acc
        first_choice -> Map.update!(acc, first_choice, &(&1 + 1))
      end
    end)
  end

  @doc """
  Extracts the winner information from the final round.

  Returns winner information map or nil if no winner was determined.
  """
  def get_winner_from_rounds(rounds) do
    case List.last(rounds) do
      %{winner: %{tied_winners: _} = winner} -> winner
      %{winner: winner} when not is_nil(winner) -> winner
      _ -> nil
    end
  end
end
