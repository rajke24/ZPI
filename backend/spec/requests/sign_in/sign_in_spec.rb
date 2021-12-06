require 'rails_helper'

describe 'Sign In', type: :request do
  let(:jarek) { User.find_by(email: 'jarek@gmail.com') }

  before(:each) do
    allow(ActiveModel::OneTimePassword::InstanceMethodsOnActivation).to receive(:otp_code).and_return '111111'
    load_test_data
  end

  context 'first step authorization' do
    it 'should authorize user' do
      get '/api/authorize_user_first_step', params: load_request('jarek_first_step_auth')
      expect(response.body).to match_snapshot('jarek_first_step_auth')
    end
  end

  context 'first step authorization mailings' do
    it 'user should receive mail with otp code' do
      assert_emails 1 do
        get '/api/authorize_user_first_step', params: load_request('jarek_first_step_auth')
        expect(ActionMailer::Base.deliveries.map { |m| m[:to].addresses.first }).to eq([jarek.email])
        expect(ActionMailer::Base.deliveries.first.body.raw_source).to match_snapshot('user_first_step_auth_mail', 'html')
      end

      # assert_emails 1 do
      #   get '/api/resend_auth_code', params: load_request('jarek_first_step_auth')
      #   # expect(ActionMailer::Base.deliveries.map { |m| m[:to].addresses.first }).to eq([jarek.email])
      #   expect(ActionMailer::Base.deliveries.first.body.raw_source).to match_snapshot('user_first_step_auth_mail', 'html')
      # end
    end
  end
end