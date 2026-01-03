defmodule FoodCaptain.Repo.Migrations.CreateSessionOptions do
  use Ecto.Migration

  def change do
    create table(:session_options, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :session_id, references(:sessions, on_delete: :nothing, type: :binary_id)

      timestamps(type: :utc_datetime)
    end

    create unique_index(:session_options, [:session_id, :name])
  end
end
