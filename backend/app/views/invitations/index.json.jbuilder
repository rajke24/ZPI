json.sent do
  json.array! @invitations[:sent] do |sent_invitation|
    json.extract! sent_invitation, :id, :created_at, :status
    json.invitee do
      json.extract! sent_invitation.invitee, :id, :email, :username
    end
  end
end

json.received do
  json.array! @invitations[:received] do |received_invitation|
    json.extract! received_invitation, :id, :created_at, :status
    json.inviter do
      json.extract! received_invitation.inviter, :id, :email, :username
    end
  end
end