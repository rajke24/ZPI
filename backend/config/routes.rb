Rails.application.routes.draw do
  scope :api, defaults: { format: :json } do
    use_doorkeeper do
      skip_controllers :sign_up
    end

    # jak coś to lepiej tworzyć routy w ten sposób
    # resource :user do
    #   member do
    #     tutaj stworzy url o takiej zawartości /users/:id/nazwa_metody
    #   end
    #   collection do
    #     tutaj stworzy url o takiej zawartości /users/nazwa_metody
    #   end
    # end

    resource :message do
      collection do
        post 'save_message'
        post 'find_message'
      end
    end
    resource :invitation, only: [:create] do

    end

    #  sign_up controller routes (te po prostu są tak proste że nawet nie wiem czy da się inaczej)
    post 'sign_up', to: 'sign_up#sign_up'
    put 'activate_account', to: 'sign_up#activate_account'
    get 'check_email_uniqueness', to: 'sign_up#check_email_uniqueness'

    get 'authorize_user_first_step', to: 'sign_in#authorize_user_first_step'
    get 'resend_auth_code', to: 'sign_in#resend_auth_code'

    post 'reset_password', to: 'passwords#reset'
    post 'forgot_password', to: 'passwords#forgot'

    get 'profile', to: 'profile#show'
  end
end
