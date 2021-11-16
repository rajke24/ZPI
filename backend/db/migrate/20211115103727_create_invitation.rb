class CreateInvitation < ActiveRecord::Migration[6.1]
  def change
    create_table :invitations do |t|
      t.references :inviter, null: false, foreign_key: { to_table: :users }
      t.references :invitee, null: false, foreign_key: { to_table: :users }
      t.string :status
      t.index [:inviter_id, :invitee_id], unique: true
      t.timestamps
    end
  end
end
