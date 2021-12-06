require 'rails_helper'

describe 'Sign Up', type: :request do

  before(:each) do
    allow(SecureRandom).to receive(:urlsafe_base64).and_return 'TOKEN'
    load_test_data
  end

  context 'user registration' do
    it 'should create new user and be able to activate it' do
      post '/api/sign_up', params: load_request('sign_up')
      registered_user = User.last

      expect(registered_user.to_json(except: [:password_digest, :updated_at])).to match_snapshot('new_user')

      put '/api/activate_account', params: { activation_token: registered_user.activation_token }
      activated_user = User.last.to_json(except: [:password_digest, :updated_at])
      expect(activated_user).to match_snapshot('activated_user')
    end
  end

  context 'sign up mailings' do
    it 'new user should receive mail activation button' do
      assert_emails 1 do
        post '/api/sign_up', params: load_request('sign_up')
        expect(ActionMailer::Base.deliveries.map { |m| m[:to].addresses.first }).to eq(["jarek.andrzejewski@gmail.com"])
        expect(ActionMailer::Base.deliveries.first.body.raw_source).to match_snapshot('new_user_mail', 'html')
      end
    end
  end

  context 'allowed params' do
    it 'api only permit limited set of parameters' do
      expect(SignUpController::ALLOWED_PARAMS.to_json).to match_snapshot("allowed_params")
    end
  end
end
