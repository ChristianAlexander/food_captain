defmodule FoodCaptainWeb.SessionsController do
  use FoodCaptainWeb, :controller

  alias FoodCaptain.Sessions

  def create(conn, %{"data" => data}) do
    {:ok, _session} = Sessions.create_session(conn.assigns.current_scope, data)
    resp(conn, :no_content, "")
  end

  def update(conn, %{"id" => id, "data" => data}) do
    user_scope = conn.assigns.current_scope

    case Sessions.get_session(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Session not found"})

      session ->
        if Sessions.session_owner?(session, user_scope) do
          {:ok, txid} =
            FoodCaptain.Repo.transact(fn repo ->
              with {:ok, _session} <- Sessions.update_session(user_scope, session, data) do
                txid = Phoenix.Sync.Writer.txid!(repo)
                {:ok, txid}
              end
            end)

          json(conn, %{txid: txid})
        else
          conn
          |> put_status(:forbidden)
          |> json(%{error: "You can only edit your own sessions"})
        end
    end
  end
end
