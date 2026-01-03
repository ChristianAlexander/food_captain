defmodule FoodCaptainWeb.PageController do
  use FoodCaptainWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end

  def app(conn, _params) do
    render(conn, :app)
  end
end
