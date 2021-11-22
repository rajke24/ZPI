class InvitationsController < ApplicationController

  def index
    @invitations = {
      sent: current_user.sent_invitations,
      received: current_user.received_invitations.where(status: 'pending')
    }
  end

  def create
    invitee = User.find_by(email: invitation_params[:invitee_email])

    invitation = Invitation.new({
                                  status: 'pending',
                                  invitee: invitee,
                                  inviter: current_user
                                })
    if invitation.save
      render json: 'success'
    else
      render json: 'error'
    end
  end

  def update
    Invitation.find_by(id: params[:id]).update!(invitation_params)
  end

  def destroy
    Invitation.destroy(params[:id])
  end

  def check
    invitee = User.find_by(email: params[:value])
    if invitee
      unique = !Invitation.where(inviter_id: current_user.id, invitee_id: invitee.id).exists?
      render json: unique
    end
  end

  def accepted
    @invitations = current_user.sent_invitations.where(status: 'accepted')
  end

  private

  ALLOWED_PARAMS = [:invitee_email, :status]

  def invitation_params
    params.permit(ALLOWED_PARAMS)
  end
end