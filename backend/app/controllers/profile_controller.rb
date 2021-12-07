class ProfileController < ApplicationController
  before_action :set_user, only: [:show, :update]

  def show
  end

  def update
    @user.update!(user_params)
    render :show, status: :ok
  end

  def validate_password
    is_valid = current_user.authenticate(params[:value]) != false
    render json: is_valid
  end

  def update_avatar
    tmp_file_path = avatar_update_params.tempfile.path

    tmp_file_basename = File.basename(tmp_file_path)
    new_avatar_file_name = Time.now.to_i.to_s + tmp_file_basename
    new_avatar_file_path = "avatars/#{new_avatar_file_name}"

    FileUtils.mkdir_p "avatars"
    FileUtils.cp tmp_file_path, new_avatar_file_path

    db_params = {avatar_path: new_avatar_file_path}
    current_user.update!(db_params)

  end

  def get_avatar
    requested_id = params["user_id"]
    user = User.find_by(id: requested_id)
    if user&.avatar_path
      file_ext = File.extname(user.avatar_path)[1..-1]

      # image/jpeg is for both .jpg and .jpeg
      if file_ext == "jpg"
        file_ext = "jpeg"
      end

      File.open(user.avatar_path, 'rb') do |f|
        read_file = f.read
        encoded = Base64.strict_encode64(read_file)
        response_data = "data:image/#{file_ext};base64,#{encoded}"
        send_data response_data, :type => "application/octet-stream", :disposition => "inline"
      end
    end
  end

  private

  def set_user
    @user = current_user
  end

  ALLOWED_PARAMS = [:username, :password]

  def user_params
    params.require(:user).permit(ALLOWED_PARAMS)
  end

  def avatar_update_params
    params.require(:file)
  end
end