require 'rails_helper'

describe 'Prekeys bundle', type: :request do
  let(:jarek) { User.find_by(email: 'jarek@gmail.com') }

  before(:each) do
    load_test_data
  end

  it 'should be able to save prekeys bundle' do
    post '/api/pre_keys_bundle', params: load_request('save_prekeys_bundle'), headers: auth_as(jarek)
    expect(response.body).to match_snapshot('save_prekeys_bundle')

    device_holding_bundle = Device.last.to_json
    expect(device_holding_bundle).to match_snapshot('device_with_saved_prekeys_bundle')
  end

  context 'allowed params' do
    it 'api only permit limited set of parameters' do
      expect(PrekeysBundleController::ALLOWED_PARAMS.to_json).to match_snapshot("allowed_params")
    end
  end
end