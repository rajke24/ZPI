Rails.application.routes.draw do
  scope :api, defaults: { format: :json } do
    use_doorkeeper

  end
end
