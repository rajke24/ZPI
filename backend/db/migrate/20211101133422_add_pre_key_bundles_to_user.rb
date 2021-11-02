class AddPreKeyBundlesToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :identity_key, :string
    add_column :users, :prekeys, :json
    add_column :users, :signed_prekey,:json
  end
end
