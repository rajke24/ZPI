class CreateDevices < ActiveRecord::Migration[6.1]
  def change
    create_table :devices do |t|
      t.string :identity_key
      t.json :prekeys
      t.json :signed_prekey
      t.references :user, null: false, foreign_key: { to_table: :users, on_delete: :cascade }
    end
  end
end
