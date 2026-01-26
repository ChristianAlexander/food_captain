defmodule FoodCaptainWeb.OptionsController do
  use FoodCaptainWeb, :controller

  alias FoodCaptain.Repo
  alias FoodCaptain.Sessions

  def create(conn, %{"data" => data, "session_id" => session_id}) do
    case Sessions.get_session(session_id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Session not found"})

      session ->
        case session.state do
          :closed ->
            conn
            |> put_status(:bad_request)
            |> json(%{error: "Cannot add options to a closed session"})

          :open ->
            {:ok, txid} =
              Repo.transact(fn repo ->
                data = if is_list(data), do: data, else: [data]

                with {:ok, _option} <- Sessions.create_session_options(session_id, data) do
                  txid = Phoenix.Sync.Writer.txid!(repo)

                  {:ok, txid}
                end
              end)

            json(conn, %{txid: txid})
        end
    end
  end

  def update(conn, %{"data" => data, "id" => id}) do
    result =
      Repo.transact(fn repo ->
        with option when not is_nil(option) <- Sessions.get_session_option(id),
             session when not is_nil(session) <- Sessions.get_session(option.session_id) do
          case session.state do
            :closed ->
              {:error, "Cannot modify options in a closed session"}

            :open ->
              with {:ok, _option} <- Sessions.update_session_option(option, data) do
                txid = Phoenix.Sync.Writer.txid!(repo)
                {:ok, txid}
              end
          end
        else
          nil -> {:error, "Option or session not found"}
        end
      end)

    case result do
      {:ok, txid_value} ->
        json(conn, %{txid: txid_value})

      {:error, message} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: message})
    end
  end
end
