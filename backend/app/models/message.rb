# == Schema Information
#
# Table name: messages
#
#  id           :bigint           not null, primary key
#  content      :text             not null
#  message_type :string           not null
#  sent_at      :datetime         not null
#  receiver_id  :bigint           not null
#  sender_id    :bigint           not null
#
# Indexes
#
#  index_messages_on_receiver_id  (receiver_id)
#  index_messages_on_sender_id    (sender_id)
#
# Foreign Keys
#
#  fk_rails_...  (receiver_id => devices.id)
#  fk_rails_...  (sender_id => devices.id)
#
class Message < ApplicationRecord
  belongs_to :sender, class_name: 'Device'
  belongs_to :receiver, class_name: 'Device'

end
