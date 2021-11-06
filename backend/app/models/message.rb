# == Schema Information
#
# Table name: messages
#
#  id           :bigint           not null, primary key
#  content      :text             not null
#  sent_at      :datetime         not null
#  type         :string           not null
#  user_from_id :bigint           not null
#  user_to_id   :bigint           not null
#
# Indexes
#
#  index_messages_on_user_from_id  (user_from_id)
#  index_messages_on_user_to_id    (user_to_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_from_id => users.id)
#  fk_rails_...  (user_to_id => users.id)
#
class Message < ApplicationRecord
  belongs_to :user_from,  class_name: "User"
  belongs_to :user_to,    class_name: "User"

end
