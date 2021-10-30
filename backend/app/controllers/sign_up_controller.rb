class SignUpController < ApplicationController
  before_action :doorkeeper_authorize!, except: [:sign_up, :check_email_uniqueness, :activate_account]

  def sign_up
    User.create!(user_params)
  end

  def activate_account
    User.find_by(activation_token: params[:activation_token]).update!(activated: true, activation_token: nil)
  end

  def check_email_uniqueness
    is_email_unique = !User.where(email: params[:value]).exists?
    render json: is_email_unique
  end

  ALLOWED_PARAMS = [:email, :password]

  def user_params
    params.require('user').permit(ALLOWED_PARAMS)
  end
end