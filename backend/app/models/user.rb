# == Schema Information
#
# Table name: users
#
#  id              :bigint           not null, primary key
#  email           :string           not null
#  password_digest :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
class User < ApplicationRecord
  has_secure_password
  has_many :access_grants,
           class_name: 'Doorkeeper::AccessGrant',
           foreign_key: :resource_owner_id,
           dependent: :delete_all # or :destroy if you need callbacks

  has_many :access_tokens,
           class_name: 'Doorkeeper::AccessToken',
           foreign_key: :resource_owner_id,
           dependent: :delete_all # or :destroy if you need callbacks

  validates_presence_of :email, :password_digest
  validates_uniqueness_of :email, case_sensitive: false

  class << self
    def authenticate(email, password)
      user = User.find_by_email(email)

      if user&.authenticate(password)
        user
      else
        raise Doorkeeper::Errors::InvalidGrantReuse
      end
    end
  end
end
