class DropOauthAccessTokensAppIdNotNullconstraint < ActiveRecord::Migration[6.1]
  def change
    change_column_null :oauth_access_tokens, :application_id, true
  end
end
