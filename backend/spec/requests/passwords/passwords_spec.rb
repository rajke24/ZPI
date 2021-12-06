require 'rails_helper'

describe 'Passwords', type: :request do
  let(:jarek) { User.find_by(email: 'jarek@gmail.com') }

  before(:each) do
    allow(SecureRandom).to receive(:urlsafe_base64).and_return 'TOKEN'
    load_test_data
  end

  context 'password reset' do
    it 'should be able to reset password if user exists' do
      post '/api/forgot_password', params: { email: jarek.email }
      expect(response.body).to match_snapshot('forgot_password_success')

      jarek_after_request = User.find_by(email: 'jarek@gmail.com')
      expect(jarek_after_request.password_reset_token).to eq('TOKEN')

      post '/api/reset_password', params: load_request('reset_password')
      expect(response.body).to match_snapshot('reset_password_success')
    end

    it 'should not be able to reset password if user does not exists' do
      post '/api/forgot_password', params: { email: 'random_email@gmail.com' }
      expect(response.body).to match_snapshot('forgot_password_error')
    end
  end

  context 'password reset mailings' do
    it 'user should receive password reset mail' do
      assert_emails 1 do
        post '/api/forgot_password', params: { email: jarek.email }
        expect(ActionMailer::Base.deliveries.map { |m| m[:to].addresses.first }).to eq([jarek.email])
        expect(ActionMailer::Base.deliveries.first.body.raw_source).to match_snapshot('password_reset_mail', 'html')
      end
    end
  end
end