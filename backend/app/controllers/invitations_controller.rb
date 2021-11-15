class InvitationsController < ApplicationController
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

  private

  ALLOWED_PARAMS = [:invitee_email]

  def invitation_params
    params.permit(ALLOWED_PARAMS)
  end
end