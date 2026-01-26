defmodule FoodCaptain.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      FoodCaptainWeb.Telemetry,
      FoodCaptain.Repo,
      {DNSCluster, query: Application.get_env(:food_captain, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: FoodCaptain.PubSub},
      # Start a worker by calling: FoodCaptain.Worker.start_link(arg)
      # {FoodCaptain.Worker, arg},
      # Start to serve requests, typically the last entry
      {FoodCaptainWeb.Endpoint, phoenix_sync: Phoenix.Sync.plug_opts()}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: FoodCaptain.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    FoodCaptainWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
