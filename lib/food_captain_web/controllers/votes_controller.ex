defmodule FoodCaptainWeb.VotesController do
  use FoodCaptainWeb, :controller
  # import Ecto.Query

  # alias Phoenix.Sync.Writer
  # alias Phoenix.Sync.Writer.Format
  # alias FoodCaptain.Sessions
  # alias FoodCaptain.Sessions.RankedChoiceVoting

  # def update(conn, %{"operations" => operations, "session_id" => session_id})
  #     when is_list(operations) do
  #   user_scope = conn.assigns.current_scope

  #   case Sessions.get_session(session_id) do
  #     nil ->
  #       conn
  #       |> put_status(:not_found)
  #       |> json(%{error: "Session not found"})

  #     %{state: :closed} ->
  #       conn
  #       |> put_status(:bad_request)
  #       |> json(%{error: "Cannot vote on a closed session"})

  #     %{state: :open} ->
  #       {:ok, txid, _changes} =
  #         Writer.new()
  #         |> Writer.allow(
  #           FoodCaptain.Sessions.Vote,
  #           load: &load_vote_for_user(&1, user_scope),
  #           validate: make_vote_validator(user_scope, session_id)
  #         )
  #         |> Writer.to_multi(operations, format: Format.TanstackDB)
  #         |> add_sequential_votes_validation(user_scope.user.id, session_id)
  #         |> Writer.transaction(FoodCaptain.Repo)

  #       json(conn, %{txid: txid})
  #   end
  # end

  # def ranked_choice_results(conn, %{"session_id" => session_id}) do
  #   case Sessions.get_ranked_choice_data(session_id) do
  #     {:error, :not_found} ->
  #       conn
  #       |> put_status(:not_found)
  #       |> json(%{error: "Session not found"})

  #     {:error, :session_not_closed} ->
  #       conn
  #       |> put_status(:bad_request)
  #       |> json(%{error: "Session must be closed to calculate ranked choice results"})

  #     {:ok, session_with_data} ->
  #       results = RankedChoiceVoting.calculate_results(session_with_data)
  #       json(conn, results)
  #   end
  # end

  # defp load_vote_for_user(%{"id" => id}, user_scope) do
  #   from(v in FoodCaptain.Sessions.Vote,
  #     where: v.id == ^id and v.user_id == ^user_scope.user.id
  #   )
  #   |> FoodCaptain.Repo.one()
  # end

  # defp make_vote_validator(user_scope, session_id) do
  #   fn vote, changes -> FoodCaptain.Sessions.Vote.changeset(vote, changes, user_scope, session_id) end
  # end

  # defp add_sequential_votes_validation(multi, user_id, session_id) do
  #   Ecto.Multi.run(multi, :validate_sequential_votes, fn _repo, _changes ->
  #     validate_sequential_votes(user_id, session_id)
  #   end)
  # end

  # defp validate_sequential_votes(user_id, session_id) do
  #   user_votes =
  #     from(v in FoodCaptain.Sessions.Vote,
  #       where: v.user_id == ^user_id and v.session_id == ^session_id,
  #       select: v.rank,
  #       order_by: v.rank
  #     )
  #     |> FoodCaptain.Repo.all()

  #   case user_votes do
  #     [] ->
  #       {:ok, nil}

  #     ranks ->
  #       unique_ranks = Enum.uniq(ranks)

  #       if length(ranks) != length(unique_ranks) do
  #         {:error, "Duplicate rankings are not allowed"}
  #       else
  #         # Check for sequential votes starting from 1
  #         expected_sequence = Enum.to_list(1..length(ranks))

  #         if ranks == expected_sequence do
  #           {:ok, nil}
  #         else
  #           {:error, "Votes must be sequential starting from 1 (e.g., 1, 2, 3)"}
  #         end
  #       end
  #   end
  # end
end
