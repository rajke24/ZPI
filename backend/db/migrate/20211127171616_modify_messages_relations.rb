class ModifyMessagesRelations < ActiveRecord::Migration[6.1]
  def change
    remove_foreign_key :messages, :users, column: :sender_id
    remove_foreign_key :messages, :users, column: :receiver_id

    add_foreign_key :messages, :devices, column: :sender_id
    add_foreign_key :messages, :devices, column: :receiver_id
  end
end
