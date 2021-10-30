class SignInController < ApplicationController
  before_action :doorkeeper_authorize!, except: [:authorize_user_first_step, :resend_auth_code]

  def authorize_user_first_step
    user = User.authenticate_first_step(params[:email], params[:password])
    user.send_two_factor_auth_mail if user
    render json: { user_exists: user.present? }
  end

  def resend_auth_code
    user = User.authenticate_first_step(params[:email], params[:password])
    user.send_two_factor_auth_mail if user
  end
end