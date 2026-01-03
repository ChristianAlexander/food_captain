defmodule FoodCaptain.Sessions do
  @moduledoc """
  The Sessions context.
  """

  import Ecto.Query, warn: false
  alias FoodCaptain.Repo

  alias FoodCaptain.Accounts.Scope
  alias FoodCaptain.Sessions.{Session, Option, Vote}

  @doc """
  Gets a single session.

  Returns `nil` if the Session does not exist.

  ## Examples

      iex> get_session(123)
      %Session{}

      iex> get_session(456)
      nil

  """
  def get_session(id) do
    Repo.get(Session, id)
  end

  @doc """
  Checks if a session belongs to the user in the given scope.

  ## Examples

      iex> session_owner?(session, scope)
      true

      iex> session_owner?(session, other_scope)
      false

  """
  def session_owner?(%Session{user_id: session_user_id}, %Scope{user: %{id: user_id}}) do
    session_user_id == user_id
  end

  def session_owner?(nil, _scope), do: false

  @doc """
  Creates a session.

  ## Examples

      iex> create_session(scope, %{field: value})
      {:ok, %Session{}}

      iex> create_session(scope, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_session(%Scope{} = scope, attrs) do
    %Session{}
    |> Session.changeset(attrs, scope)
    |> Repo.insert()
  end

  @doc """
  Updates a session.

  ## Examples

      iex> update_session(scope, session, %{field: new_value})
      {:ok, %Session{}}

      iex> update_session(scope, session, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_session(%Scope{} = scope, %Session{} = session, attrs) do
    if session_owner?(session, scope) do
      session
      |> Session.changeset(attrs, scope)
      |> Repo.update()
    else
      {:error, "Session does not belong to the user"}
    end
  end

  @doc """
  Updates session votes for a user.

  This function replaces all existing votes for the user in the given session
  with the provided votes data.

  ## Examples

      iex> update_session_votes(scope, session_id, [%{option_id: "123", rank: 1}])
      {:ok, [%Vote{}]}

      iex> update_session_votes(scope, session_id, [%{option_id: "invalid", rank: 1}])
      {:error, %Ecto.Changeset{}}

  """
  def update_session_votes(%Scope{} = scope, session_id, votes_data) do
    user_id = scope.user.id

    # Delete existing votes for this user and session
    from(v in Vote,
      where: v.user_id == ^user_id and v.session_id == ^session_id
    )
    |> Repo.delete_all()

    # Insert new votes
    votes_changesets =
      Enum.map(votes_data, fn vote_attrs ->
        %Vote{}
        |> Vote.changeset(vote_attrs, scope)
        |> Ecto.Changeset.put_change(:session_id, session_id)
      end)

    # Check if all changesets are valid
    case Enum.find(votes_changesets, &(not &1.valid?)) do
      nil ->
        # All valid, insert them
        votes =
          Enum.map(votes_changesets, fn changeset ->
            {:ok, vote} = Repo.insert(changeset)
            vote
          end)

        {:ok, votes}

      invalid_changeset ->
        {:error, invalid_changeset}
    end
  end

  def get_session_option(id) do
    Repo.get(Option, id)
  end

  def create_session_option(session_id, attrs) do
    %Option{}
    |> Option.changeset(attrs, session_id)
    |> Repo.insert()
  end

  def update_session_option(%Option{} = option, attrs) do
    option
    |> Option.changeset(attrs, option.session_id)
    |> Repo.update()
  end

  def list_sessions_query(%Scope{} = scope) do
    from s in Session, where: s.user_id == ^scope.user.id
  end

  def get_session_query(id) do
    from s in Session, where: s.id == ^id
  end

  def get_session_options_query(id) do
    from o in Option, where: o.session_id == ^id
  end

  def get_session_my_votes_query(%Scope{} = scope, session_id) do
    from v in Vote,
      where:
        v.user_id == ^scope.user.id and
          v.session_id == ^session_id
  end

  @doc """
  Gets ranked choice voting data for a closed session.

  Returns the session with all votes and options preloaded, or an error if the session
  is not found, doesn't belong to the user, or is not closed.
  """
  def get_ranked_choice_data(session_id) do
    case Repo.get(Session, session_id) do
      nil ->
        {:error, :not_found}

      %Session{state: :open} ->
        {:error, :session_not_closed}

      %Session{state: :closed} = session ->
        # Get session with all votes from all users and all options
        votes_query = from(v in Vote, order_by: [v.user_id, v.rank])

        session_with_data =
          Repo.preload(session, [:options, votes: votes_query])

        {:ok, session_with_data}
    end
  end
end
