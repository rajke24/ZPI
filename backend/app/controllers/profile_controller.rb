class ProfileController < ApplicationController
  before_action :set_user, only: [:show, :update]

  def show
  end

  def update
    @user.update!(user_params)
    render :show, status: :ok
  end

  def validate_password
    res = current_user.authenticate(params[:value]) != false
    render json: res
  end

  private

  def set_user
    @user = current_user
  end

  ALLOWED_PARAMS = [:username, :password]

  def user_params
    params.require(:user).permit(ALLOWED_PARAMS)
  end
end