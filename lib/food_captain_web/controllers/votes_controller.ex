defmodule FoodCaptainWeb.VotesController do
  use FoodCaptainWeb, :controller

  import Ecto.Query

  alias Phoenix.Sync.Writer
  alias FoodCaptain.Sessions

  def update(conn, %{"operations" => operations, "session_id" => session_id})
      when is_list(operations) do
    user_scope = conn.assigns.current_scope

    case Sessions.get_session(session_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Session not found"})

      _session ->
        {:ok, txid, _changes} =
          Writer.new()
          |> Writer.allow(
            Sessions.Vote,
            load: fn attrs -> Sessions.get_user_vote(attrs, user_scope) end,
            validate: fn vote, changes ->
              Sessions.Vote.changeset(vote, changes, user_scope, session_id)
            end
          )
          |> Writer.to_multi(operations, format: Writer.Format.TanstackDB)
          |> Ecto.Multi.run(:validate_sequential_votes, fn repo, _changes ->
            user_votes =
              from(v in FoodCaptain.Sessions.Vote,
                where: v.user_id == ^user_scope.user.id and v.session_id == ^session_id,
                select: v.rank,
                order_by: v.rank
              )
              |> repo.all()

            case user_votes do
              [] ->
                {:ok, nil}

              ranks ->
                unique_ranks = Enum.uniq(ranks)

                if length(ranks) != length(unique_ranks) do
                  {:error, "Duplicate rankings are not allowed"}
                else
                  # Check for sequential votes starting from 1
                  expected_sequence = Enum.to_list(1..length(ranks))

                  if ranks == expected_sequence do
                    {:ok, nil}
                  else
                    {:error, "Votes must be sequential starting from 1 (e.g., 1, 2, 3)"}
                  end
                end
            end
          end)
          |> Writer.transaction(FoodCaptain.Repo)

        json(conn, %{txid: txid})
    end
  end

  def ranked_choice_results(conn, %{"session_id" => session_id}) do
    case Sessions.get_ranked_choice_data(session_id) do
      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Session not found"})

      {:error, :session_not_closed} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Session must be closed to calculate ranked choice results"})

      {:ok, session_with_data} ->
        results = Sessions.RankedChoiceVoting.calculate_results(session_with_data)
        json(conn, results)
    end
  end
end
