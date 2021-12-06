require 'rails_helper'

describe 'Messages', type: :request do

  before(:each) do
    load_test_data
  end

  context 'allowed params' do
    it 'api only permit limited set of parameters' do
      expect(MessagesController::ALLOWED_PARAMS.to_json).to match_snapshot("allowed_params")
    end
  end
end