defmodule FoodCaptain.Sessions.Session do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "sessions" do
    field :name, :string
    field :state, Ecto.Enum, values: [:open, :closed], default: :open
    field :user_id, :binary_id

    has_many :options, FoodCaptain.Sessions.Option, foreign_key: :session_id
    has_many :votes, FoodCaptain.Sessions.Vote, foreign_key: :session_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(session, attrs, user_scope) do
    session
    |> cast(attrs, [:name, :state])
    |> validate_required([:name])
    |> put_change(:user_id, user_scope.user.id)
  end
end
