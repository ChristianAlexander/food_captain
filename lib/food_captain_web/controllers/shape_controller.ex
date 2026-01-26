defmodule FoodCaptainWeb.ShapeController do
  use FoodCaptainWeb, :controller

  import Phoenix.Sync.Controller

  alias FoodCaptain.Sessions

  def my_sessions(conn, params) do
    query = Sessions.list_sessions_query(conn.assigns.current_scope)
    sync_render(conn, params, query)
  end

  def session(conn, %{"id" => id} = params) do
    sync_render(conn, params, Sessions.get_session_query(id))
  end

  def session_options(conn, %{"id" => id} = params) do
    sync_render(conn, params, Sessions.get_session_options_query(id))
  end

  def my_session_votes(conn, %{"id" => id} = params) do
    sync_render(
      conn,
      params,
      Sessions.get_session_my_votes_query(conn.assigns.current_scope, id)
    )
  end
end
