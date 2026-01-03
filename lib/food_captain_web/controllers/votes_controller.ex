defmodule FoodCaptainWeb.VotesController do
  use FoodCaptainWeb, :controller

  import Ecto.Query

  alias Phoenix.Sync.Writer
  alias FoodCaptain.Sessions

  def update(conn, %{"operations" => operations, "session_id" => session_id})
      when is_list(operations) do
    _user_scope = conn.assigns.current_scope

    case Sessions.get_session(session_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Session not found"})

      _session ->
        resp(conn, :no_content, "")
    end
  end
end
