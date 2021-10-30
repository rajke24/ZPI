class PasswordsController < ApplicationController
  before_action :doorkeeper_authorize!, except: [:forgot, :reset]

  def forgot
    user = User.find_by(email: params[:email])
    if user
      user.send_password_reset
      render json: { message: "Password reset email sent successfully", success: true }
    else
      render json: { message: "No such user exists", success: false }
    end
  end

  def reset
    user = User.find_by(password_reset_token: params[:token])
    if user.present? && user.password_token_valid?
      if user.reset_password(params[:password])
        render json: { message: "Your password has been successfully reset!", successful: true }
      end
    else
      render json: { message: "Your password reset token has expired!", successful: false }
    end
  end
end