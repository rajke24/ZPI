require 'rails_helper'

describe 'Profile', type: :request do
  let(:jarek) { User.find_by(email: 'jarek@gmail.com') }
  let(:dawid) { User.find_by(email: 'dawid@gmail.com') }

  before(:each) do
    load_test_data
  end

  context 'functionality' do
    it 'should be able to fetch profile data' do
      get '/api/profile', headers: auth_as(jarek)
      expect(response.body).to match_snapshot('jarek_profile')

      get '/api/profile', headers: auth_as(dawid)
      expect(response.body).to match_snapshot('dawid_profile')
    end

    it 'should be able to update profile' do
      put '/api/profile', params: load_request('update_jarek_profile'), headers: auth_as(jarek)
      expect(response.body).to match_snapshot('updated_jarek_profile')
    end
  end

  context 'validation' do
    it 'should validate user current password' do
      get '/api/profile/validate_password?value=hasloJarka', headers: auth_as(jarek)
      expect(response.body).to eq('true')

      get '/api/profile/validate_password?value=gibberish', headers: auth_as(jarek)
      expect(response.body).to eq('false')
    end
  end

  context 'allowed params' do
    it 'api only permit limited set of parameters' do
      expect(ProfileController::ALLOWED_PARAMS.to_json).to match_snapshot('allowed_params')
    end
  end
end