class AddActivationTokenToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :activation_token, :string
    add_column :users, :activated, :boolean
  end
end
