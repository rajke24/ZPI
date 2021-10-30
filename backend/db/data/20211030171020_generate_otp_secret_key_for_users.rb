# frozen_string_literal: true

class GenerateOtpSecretKeyForUsers < ActiveRecord::Migration[6.1]
  def up
    User.find_each { |user| user.update_attribute(:otp_secret_key, User.otp_random_secret) }
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
