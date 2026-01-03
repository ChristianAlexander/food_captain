defmodule FoodCaptain.Sessions.Vote do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "session_votes" do
    field :rank, :integer
    field :session_id, :binary_id
    field :option_id, :binary_id
    field :user_id, :binary_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(vote, attrs, user_scope, session_id \\ nil) do
    vote
    |> cast(attrs, [:rank, :option_id])
    |> validate_required([:rank, :option_id])
    |> validate_number(:rank, greater_than_or_equal_to: 1)
    |> put_change(:user_id, user_scope.user.id)
    |> maybe_put_session_id(session_id)
  end

  defp maybe_put_session_id(changeset, nil), do: changeset
  defp maybe_put_session_id(changeset, session_id), do: put_change(changeset, :session_id, session_id)
end
