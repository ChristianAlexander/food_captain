defmodule FoodCaptain.Repo.Migrations.CreateSessionVotes do
  use Ecto.Migration

  def change do
    create table(:session_votes, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :rank, :integer
      add :session_id, references(:sessions, on_delete: :nothing, type: :binary_id)
      add :option_id, references(:session_options, on_delete: :nothing, type: :binary_id)
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all)

      timestamps(type: :utc_datetime)
    end

    create index(:session_votes, [:session_id, :user_id, :rank])
  end
end
