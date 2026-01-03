# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     FoodCaptain.Repo.insert!(%FoodCaptain.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias FoodCaptain.{Accounts, Sessions}
alias FoodCaptain.Accounts.Scope

# Demo restaurant options (same as the UI demo button)
demo_restaurants = [
  "Pizza Palace",
  "Burger Barn",
  "Taco Town",
  "Sushi Spot",
  "Pasta Place"
]

# Sample users with their voting preferences (ranked choice)
# Each user's list represents their preference order (1st choice, 2nd choice, etc.)
sample_users = [
  %{
    email: "alice@example.com",
    votes: ["Pizza Palace", "Sushi Spot", "Taco Town"]
  },
  %{
    email: "bob@example.com",
    votes: ["Burger Barn", "Pizza Palace", "Pasta Place"]
  },
  %{
    email: "carol@example.com",
    votes: ["Sushi Spot", "Pasta Place", "Pizza Palace", "Taco Town"]
  },
  %{
    email: "david@example.com",
    votes: ["Taco Town", "Burger Barn"]
  },
  %{
    email: "eve@example.com",
    votes: ["Pasta Place", "Sushi Spot", "Burger Barn", "Pizza Palace", "Taco Town"]
  }
]

# Create session owner
{:ok, owner} =
  Accounts.register_user(%{
    email: "owner@example.com",
    password: "password123456",
    password_confirmation: "password123456"
  })

# Create a demo session
owner_scope = Scope.for_user(owner)

{:ok, session} =
  Sessions.create_session(owner_scope, %{name: "Team Lunch Vote"})

options =
  Enum.map(demo_restaurants, fn name ->
    {:ok, option} = Sessions.create_session_option(session.id, %{name: name})
    option
  end)

# Build a lookup map for option names to IDs
option_lookup = Map.new(options, fn opt -> {opt.name, opt.id} end)

# Create sample users and their votes
IO.puts("Creating sample users and votes...")

Enum.each(sample_users, fn %{email: email, votes: vote_preferences} ->
  {:ok, user} =
    Accounts.register_user(%{
      email: email,
      password: "password123456",
      password_confirmation: "password123456"
    })

  # Build votes data with sequential ranks
  votes_data =
    vote_preferences
    |> Enum.with_index(1)
    |> Enum.map(fn {restaurant_name, rank} ->
      %{
        rank: rank,
        option_id: Map.fetch!(option_lookup, restaurant_name)
      }
    end)

  user_scope = Scope.for_user(user)
  {:ok, _votes} = Sessions.update_session_votes(user_scope, session.id, votes_data)
end)

IO.puts("\nSeed complete!")
IO.puts("Session ID: #{session.id}")
IO.puts("Owner login: owner@example.com / password123456")
IO.puts("Sample user logins: alice@example.com, bob@example.com, etc. / password123456")
