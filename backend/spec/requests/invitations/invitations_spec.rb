require 'rails_helper'

describe 'Invitations', type: :request do
  let(:jarek) { User.find_by(email: 'jarek@gmail.com') }
  let(:jacek) { User.find_by(email: 'jacek@gmail.com') }
  let(:maciek) { User.find_by(email: 'maciek@gmail.com') }

  before(:each) do
    load_test_data
  end

  context 'loading' do
    it 'user should be able to load all invitations linked with him' do
      get '/api/invitations', headers: auth_as(jarek)
      expect(response.body).to match_snapshot('jarek_invitations')

      get '/api/invitations', headers: auth_as(jacek)
      expect(response.body).to match_snapshot('jacek_invitations')
    end

    it 'user should be able to load all accepted invitations sent by him' do
      get '/api/invitations/accepted', headers: auth_as(jarek)
      expect(response.body).to match_snapshot('jarek_accepted_sent_invitations')

      get '/api/invitations/accepted', headers: auth_as(jacek)
      expect(response.body).to match_snapshot('jacek_accepted_sent_invitations')
    end
  end

  context 'management' do
    it 'user should be able to send invitations' do
      post '/api/invitations', params: { invitee_email: jarek.email }, headers: auth_as(maciek)
      expect(response).to have_http_status(:created)

      post '/api/invitations', params: { invitee_email: jacek.email }, headers: auth_as(maciek)
      expect(response).to have_http_status(:created)

      get '/api/invitations', headers: auth_as(maciek)
      expect(response.body).to match_snapshot('maciek_invitations')
    end

    it 'user should be able to accept or reject invitations' do
      invitation1 = Invitation.create!(inviter: jarek, invitee: maciek, status: 'pending')
      invitation2 = Invitation.create!(inviter: jacek, invitee: maciek, status: 'pending')

      put "/api/invitations/#{invitation1.id}", params: { status: 'accepted' }, headers: auth_as(maciek)
      put "/api/invitations/#{invitation2.id}", params: { status: 'rejected' }, headers: auth_as(maciek)

      maciek_accepted_invitations = Invitation.where(invitee: maciek, status: 'accepted')
      maciek_rejected_invitations = Invitation.where(invitee: maciek, status: 'rejected')

      expect(maciek_accepted_invitations.size).to eql(1)
      expect(maciek_rejected_invitations.size).to eql(1)
    end

    it 'user should be able to cancel invitations sent by him' do
      post '/api/invitations', params: { invitee_email: jarek.email }, headers: auth_as(maciek)
      expect(response).to have_http_status(:created)

      post '/api/invitations', params: { invitee_email: jacek.email }, headers: auth_as(maciek)
      expect(response).to have_http_status(:created)

      last_invitation_sent_by_maciek = Invitation.where(inviter_id: maciek.id).last

      delete "/api/invitations/#{last_invitation_sent_by_maciek.id}", headers: auth_as(maciek)

      get '/api/invitations', headers: auth_as(maciek)
      expect(response.body).to match_snapshot('maciek_invitations_after_canceling')
    end
  end


  context 'allowed params' do
    it 'api only permit limited set of parameters' do
      expect(InvitationsController::ALLOWED_PARAMS.to_json).to match_snapshot("allowed_params")
    end
  end
end