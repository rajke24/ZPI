json.array! @invitations do |i|
  json.extract! i, :id, :status
  json.invitee do
    json.extract! i.invitee, :id, :email
  end
end