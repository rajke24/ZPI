# == Schema Information
#
# Table name: invitations
#
#  id         :bigint           not null, primary key
#  status     :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  invitee_id :bigint           not null
#  inviter_id :bigint           not null
#
# Indexes
#
#  index_invitations_on_invitee_id                 (invitee_id)
#  index_invitations_on_inviter_id                 (inviter_id)
#  index_invitations_on_inviter_id_and_invitee_id  (inviter_id,invitee_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (invitee_id => users.id)
#  fk_rails_...  (inviter_id => users.id)
#
class Invitation < ApplicationRecord
  belongs_to :inviter, class_name: "User"
  belongs_to :invitee, class_name: "User"

  validates :invitee_id, uniqueness: { scope: :inviter_id }
end
