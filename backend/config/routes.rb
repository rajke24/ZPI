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


    #  sign_up controller routes (te po prostu są tak proste że nawet nie wiem czy da się inaczej)
    post 'sign_up', to: 'sign_up#sign_up'
    put 'activate_account', to: 'sign_up#activate_account'
    get 'check_email_uniqueness', to: 'sign_up#check_email_uniqueness'
  end
end
