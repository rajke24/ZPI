module TestHelper
  
  def load_request(req)
    requests_dir = File.dirname(self.class.metadata[:file_path]) << "/__requests__"
    request_path = File.join(requests_dir, "#{req}.json")
    file = File.new(request_path)
    @result = ERB.new(file.read).result(binding)
    file.close
    JSON.parse(@result)
  end
  
  def auth_as(user)
    {
      'Authorization': TestHelper.auth_token(user),
      'Origin': TestHelper.test_origin
    }
  end

  def self.auth_token(user)
    'Bearer ' + Doorkeeper::AccessToken.create!(resource_owner_id: user.id).token
  end

  def self.test_origin
    Rails.configuration.frontend_url
  end
end
