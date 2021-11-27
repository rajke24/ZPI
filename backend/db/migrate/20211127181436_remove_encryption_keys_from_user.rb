class RemoveEncryptionKeysFromUser < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :identity_key
    remove_column :users, :prekeys
    remove_column :users, :signed_prekey
  end
end
