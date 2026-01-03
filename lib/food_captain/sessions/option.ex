defmodule FoodCaptain.Sessions.Option do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "session_options" do
    field :name, :string
    field :session_id, :binary_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(option, attrs, session_id) do
    option
    |> cast(attrs, [:name])
    |> validate_required([:name])
    |> put_change(:session_id, session_id)
  end
end
