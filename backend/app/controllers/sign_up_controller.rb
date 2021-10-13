class SignUpController < ApplicationController
  before_action :doorkeeper_authorize!, except: [:sign_up]

  def sign_up
    User.create!(user_params)
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