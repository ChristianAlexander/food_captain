defmodule FoodCaptainWeb.UserSessionHTML do
  use FoodCaptainWeb, :html

  embed_templates "user_session_html/*"

  defp local_mail_adapter? do
    Application.get_env(:food_captain, FoodCaptain.Mailer)[:adapter] == Swoosh.Adapters.Local
  end
end
