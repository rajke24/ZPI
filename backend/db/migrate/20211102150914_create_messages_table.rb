class CreateMessagesTable < ActiveRecord::Migration[6.1]
  def change
    create_table :messages do |t|
      t.references  :user_from,   null:false, foreign_key: {to_table: :users}
      t.references  :user_to,     null:false, foreign_key: {to_table: :users}
      t.text        :content,     null:false
      t.string      :type,        null:false
      t.datetime    :sent_at,     null:false
    end
  end
end
