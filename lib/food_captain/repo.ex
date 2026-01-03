defmodule FoodCaptain.Repo do
  use Ecto.Repo,
    otp_app: :food_captain,
    adapter: Ecto.Adapters.Postgres
end
