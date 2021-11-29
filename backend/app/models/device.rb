# == Schema Information
#
# Table name: devices
#
#  id                      :bigint           not null, primary key
#  identity_key            :string
#  in_user_hierarchy_index :bigint           not null
#  prekeys                 :json
#  signed_prekey           :json
#  user_id                 :bigint           not null
#
# Indexes
#
#  index_devices_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id) ON DELETE => cascade
#
class Device < ApplicationRecord
  belongs_to :user

  has_many :messages
end
