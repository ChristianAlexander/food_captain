defmodule FoodCaptain.Sessions.RankedChoiceVotingTest do
  use ExUnit.Case, async: true

  alias FoodCaptain.Sessions.RankedChoiceVoting
  alias FoodCaptain.Sessions.{Session, Vote, Option}

  describe "calculate_results/1" do
    test "calculates winner with majority in first round" do
      session = %Session{
        id: "session-1",
        name: "Lunch Choice",
        votes: [
          %Vote{user_id: "user-1", option_id: "pizza", rank: 1},
          %Vote{user_id: "user-2", option_id: "pizza", rank: 1},
          %Vote{user_id: "user-3", option_id: "burgers", rank: 1}
        ],
        options: [
          %Option{id: "pizza", name: "Pizza"},
          %Option{id: "burgers", name: "Burgers"}
        ]
      }

      result = RankedChoiceVoting.calculate_results(session)

      assert result.session_id == "session-1"
      assert result.session_name == "Lunch Choice"
      assert result.total_voters == 3
      assert result.total_options == 2
      assert result.options == %{"pizza" => "Pizza", "burgers" => "Burgers"}

      assert length(result.rounds) == 1
      first_round = List.first(result.rounds)
      assert first_round.round == 1
      assert first_round.vote_counts == %{"pizza" => 2, "burgers" => 1}
      assert first_round.total_votes == 3
      assert first_round.majority_threshold == 2
      assert first_round.winner.option_id == "pizza"
      assert first_round.winner.option_name == "Pizza"
      assert first_round.winner.vote_count == 2

      assert result.winner.option_id == "pizza"
    end

    test "handles elimination rounds when no majority" do
      session = %Session{
        id: "session-2",
        name: "Restaurant Choice",
        votes: [
          # User 1: Italian > Mexican > Chinese
          %Vote{user_id: "user-1", option_id: "italian", rank: 1},
          %Vote{user_id: "user-1", option_id: "mexican", rank: 2},
          %Vote{user_id: "user-1", option_id: "chinese", rank: 3},
          # User 2: Mexican > Chinese > Italian
          %Vote{user_id: "user-2", option_id: "mexican", rank: 1},
          %Vote{user_id: "user-2", option_id: "chinese", rank: 2},
          %Vote{user_id: "user-2", option_id: "italian", rank: 3},
          # User 3: Chinese > Italian > Mexican
          %Vote{user_id: "user-3", option_id: "chinese", rank: 1},
          %Vote{user_id: "user-3", option_id: "italian", rank: 2},
          %Vote{user_id: "user-3", option_id: "mexican", rank: 3},
          # User 4: Italian > Chinese > Mexican (breaks the tie)
          %Vote{user_id: "user-4", option_id: "italian", rank: 1},
          %Vote{user_id: "user-4", option_id: "chinese", rank: 2},
          %Vote{user_id: "user-4", option_id: "mexican", rank: 3}
        ],
        options: [
          %Option{id: "italian", name: "Italian"},
          %Option{id: "mexican", name: "Mexican"},
          %Option{id: "chinese", name: "Chinese"}
        ]
      }

      result = RankedChoiceVoting.calculate_results(session)

      assert result.total_voters == 4
      assert result.total_options == 3

      # Should have multiple rounds since no majority in first round
      assert length(result.rounds) > 1

      # First round: Italian=2, Mexican=1, Chinese=1
      first_round = List.first(result.rounds)
      assert first_round.vote_counts == %{"italian" => 2, "mexican" => 1, "chinese" => 1}
      assert first_round.total_votes == 4
      assert first_round.majority_threshold == 3
      assert is_nil(first_round.winner)

      # Should have elimination information (Mexican and Chinese tied for last)
      assert not is_nil(first_round.eliminated)
    end

    test "handles complete tie in first round" do
      session = %Session{
        id: "session-tie",
        name: "Complete Tie",
        votes: [
          # User 1: Italian > Mexican > Chinese
          %Vote{user_id: "user-1", option_id: "italian", rank: 1},
          %Vote{user_id: "user-1", option_id: "mexican", rank: 2},
          %Vote{user_id: "user-1", option_id: "chinese", rank: 3},
          # User 2: Mexican > Chinese > Italian
          %Vote{user_id: "user-2", option_id: "mexican", rank: 1},
          %Vote{user_id: "user-2", option_id: "chinese", rank: 2},
          %Vote{user_id: "user-2", option_id: "italian", rank: 3},
          # User 3: Chinese > Italian > Mexican
          %Vote{user_id: "user-3", option_id: "chinese", rank: 1},
          %Vote{user_id: "user-3", option_id: "italian", rank: 2},
          %Vote{user_id: "user-3", option_id: "mexican", rank: 3}
        ],
        options: [
          %Option{id: "italian", name: "Italian"},
          %Option{id: "mexican", name: "Mexican"},
          %Option{id: "chinese", name: "Chinese"}
        ]
      }

      result = RankedChoiceVoting.calculate_results(session)

      assert result.total_voters == 3
      assert result.total_options == 3

      # Should have only one round since all options are tied
      assert length(result.rounds) == 1

      # First round should show complete tie with 1 vote each
      first_round = List.first(result.rounds)
      assert first_round.vote_counts == %{"italian" => 1, "mexican" => 1, "chinese" => 1}
      assert first_round.total_votes == 3
      assert first_round.majority_threshold == 2
      assert is_nil(first_round.eliminated)

      # Should declare a complete tie
      assert Map.has_key?(result.winner, :tied_winners)
      assert length(result.winner.tied_winners) == 3
    end

    test "handles ties in final result" do
      session = %Session{
        id: "session-3",
        name: "Tie Game",
        votes: [
          %Vote{user_id: "user-1", option_id: "option-a", rank: 1},
          %Vote{user_id: "user-2", option_id: "option-b", rank: 1}
        ],
        options: [
          %Option{id: "option-a", name: "Option A"},
          %Option{id: "option-b", name: "Option B"}
        ]
      }

      result = RankedChoiceVoting.calculate_results(session)

      assert result.total_voters == 2
      _final_round = List.last(result.rounds)

      # Should declare a tie
      assert Map.has_key?(result.winner, :tied_winners)
      assert length(result.winner.tied_winners) == 2
    end

    test "handles empty votes" do
      session = %Session{
        id: "session-4",
        name: "No Votes",
        votes: [],
        options: [
          %Option{id: "option-a", name: "Option A"},
          %Option{id: "option-b", name: "Option B"}
        ]
      }

      result = RankedChoiceVoting.calculate_results(session)

      assert result.total_voters == 0
      assert result.total_options == 2
      # Should handle gracefully with no votes
      assert is_list(result.rounds)
    end
  end

  describe "build_user_ballots/1" do
    test "groups votes by user and sorts by rank" do
      votes = [
        %Vote{user_id: "user-1", option_id: "opt-c", rank: 3},
        %Vote{user_id: "user-1", option_id: "opt-a", rank: 1},
        %Vote{user_id: "user-1", option_id: "opt-b", rank: 2},
        %Vote{user_id: "user-2", option_id: "opt-b", rank: 1},
        %Vote{user_id: "user-2", option_id: "opt-a", rank: 2}
      ]

      result = RankedChoiceVoting.build_user_ballots(votes)

      assert result == %{
        "user-1" => ["opt-a", "opt-b", "opt-c"],
        "user-2" => ["opt-b", "opt-a"]
      }
    end

    test "handles empty votes list" do
      result = RankedChoiceVoting.build_user_ballots([])
      assert result == %{}
    end
  end

  describe "count_first_choice_votes/2" do
    test "counts first choice votes for active options" do
      user_ballots = %{
        "user-1" => ["opt-a", "opt-b", "opt-c"],
        "user-2" => ["opt-b", "opt-a", "opt-c"],
        "user-3" => ["opt-c", "opt-a", "opt-b"]
      }
      active_options = ["opt-a", "opt-b", "opt-c"]

      result = RankedChoiceVoting.count_first_choice_votes(user_ballots, active_options)

      assert result == %{"opt-a" => 1, "opt-b" => 1, "opt-c" => 1}
    end

    test "skips eliminated options and uses next choice" do
      user_ballots = %{
        "user-1" => ["opt-a", "opt-b", "opt-c"],
        "user-2" => ["opt-a", "opt-b", "opt-c"],
        "user-3" => ["opt-c", "opt-b", "opt-a"]
      }
      # opt-a has been eliminated
      active_options = ["opt-b", "opt-c"]

      result = RankedChoiceVoting.count_first_choice_votes(user_ballots, active_options)

      # user-1 and user-2's first choice (opt-a) is eliminated, so they vote for opt-b
      # user-3's first choice (opt-c) is still active
      assert result == %{"opt-b" => 2, "opt-c" => 1}
    end

    test "handles users with no valid choices" do
      user_ballots = %{
        "user-1" => ["opt-a", "opt-b"],
        "user-2" => ["opt-c"]
      }
      # Only opt-d is active, but no user has it in their ballot
      active_options = ["opt-d"]

      result = RankedChoiceVoting.count_first_choice_votes(user_ballots, active_options)

      assert result == %{"opt-d" => 0}
    end
  end

  describe "get_winner_from_rounds/1" do
    test "returns single winner from final round" do
      rounds = [
        %{winner: nil},
        %{winner: %{option_id: "pizza", option_name: "Pizza", vote_count: 3}}
      ]

      result = RankedChoiceVoting.get_winner_from_rounds(rounds)

      assert result == %{option_id: "pizza", option_name: "Pizza", vote_count: 3}
    end

    test "returns tied winners from final round" do
      rounds = [
        %{winner: nil},
        %{winner: %{tied_winners: [
          %{option_id: "pizza", option_name: "Pizza", vote_count: 2},
          %{option_id: "burgers", option_name: "Burgers", vote_count: 2}
        ]}}
      ]

      result = RankedChoiceVoting.get_winner_from_rounds(rounds)

      assert Map.has_key?(result, :tied_winners)
      assert length(result.tied_winners) == 2
    end

    test "returns nil when no winner in rounds" do
      rounds = [%{winner: nil}, %{winner: nil}]

      result = RankedChoiceVoting.get_winner_from_rounds(rounds)

      assert is_nil(result)
    end

    test "handles empty rounds list" do
      result = RankedChoiceVoting.get_winner_from_rounds([])

      assert is_nil(result)
    end
  end
end
