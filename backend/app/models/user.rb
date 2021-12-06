# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  activated              :boolean
#  activation_token       :string
#  email                  :string           not null
#  otp_secret_key         :string
#  password_digest        :string           not null
#  password_reset_sent_at :datetime
#  password_reset_token   :string
#  username               :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
class User < ApplicationRecord
  has_secure_password
  has_one_time_password

  before_create :generate_activation_token
  after_create :send_new_user_email
  before_validation :defaults

  has_many :access_grants,
           class_name: 'Doorkeeper::AccessGrant',
           foreign_key: :resource_owner_id,
           dependent: :delete_all # or :destroy if you need callbacks

  has_many :access_tokens,
           class_name: 'Doorkeeper::AccessToken',
           foreign_key: :resource_owner_id,
           dependent: :delete_all # or :destroy if you need callbacks

  has_many :devices, dependent: :delete_all

  has_many :received_messages,
           through: :devices,
           :foreign_key => "receiver_id",
           :class_name => "Message"

  has_many :sent_messages,
           through: :devices,
           :foreign_key => "sender_id",
           :class_name => "Message"

  has_many :sent_invitations,
           :foreign_key => "inviter_id",
           :class_name => "Invitation"

  has_many :received_invitations,
           :foreign_key => 'invitee_id',
           :class_name => "Invitation"

  validates_presence_of :email, :password_digest
  validates_uniqueness_of :email, case_sensitive: false

  class << self
    def authenticate_first_step(email, password)
      user = User.find_by_email(email)

      if user&.authenticate(password) && user&.activated
        user
      else
        nil
      end
    end

    def authenticate_second_step(email, password, authentication_code)
      user = User.find_by_email(email)

      if user&.authenticate(password) && user&.authenticate_otp(authentication_code, drift: 60)
        user
      else
        raise Doorkeeper::Errors::InvalidGrantReuse
      end
    end
  end

  def send_password_reset
    self.password_reset_token = SecureRandom.urlsafe_base64
    self.password_reset_sent_at = Time.zone.now
    save!
    Mailer.send_password_reset_mail(self.email, {
      link: "#{Rails.configuration.frontend_url}/reset_password/#{self.password_reset_token}"
    }).deliver_later
  end

  def password_token_valid?
    (self.password_reset_sent_at + 1.hour) > Time.zone.now
  end

  def reset_password(password)
    self.password_reset_token = nil
    self.password = password
    save!
  end

  def send_two_factor_auth_mail
    Mailer.send_two_factor_auth_mail(email, {
      code: otp_code
    }).deliver_later
  end

  private

  def send_new_user_email
    if password
      Mailer.send_user_email(email, {
        recipient_username: username,
        link: "#{Rails.configuration.frontend_url}/login/#{self.activation_token}"
      }).deliver_later
    end
  end

  def generate_activation_token
    self.activation_token = SecureRandom.urlsafe_base64
    generate_activation_token if User.exists?(activation_token: self.activation_token) && !Rails.env.test?
  end

  def defaults
    self.activated ||= false
  end
end
