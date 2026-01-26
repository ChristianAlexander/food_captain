defmodule FoodCaptainWeb.OptionsController do
  use FoodCaptainWeb, :controller

  alias FoodCaptain.Sessions

  def create(conn, %{"data" => data, "session_id" => session_id}) do
    case Sessions.get_session(session_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Session not found"})

      _session ->
        data = if is_list(data), do: data, else: [data]
        {:ok, _option} = Sessions.create_session_options(session_id, data)
        resp(conn, :no_content, "")
    end
  end

  def update(conn, %{"data" => data, "id" => id}) do
    case Sessions.get_session_option(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Session not found"})

      option ->
        {:ok, _option} = Sessions.update_session_option(option, data)
        resp(conn, :no_content, "")
    end
  end
end
