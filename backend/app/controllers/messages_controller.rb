class MessagesController < ApplicationController
  def save_message
    passed_params = message_params

    destination_user = User.first(email: passed_params[:mail_to])

    params_for_save = {
      user_from: current_user.id,
      user_to: destination_user.id,
      content: passed_params[:content],
      type: passed_params[:type],
      sent_at: passed_params[:sent_at]
    }

    Message.create!(params_for_save)
  end

  def find_waiting_messages
    # waiting_messages = Message.where("mail_to = ?", current_user.email)
    waiting_messages = current_user.received_messages
    # TODO wait for confirmation from user?
    waiting_messages.delete_all
  end

  PASSED_MESSAGE_PARAMS = [:content, :mail_to, :sent_at, :type]

  def message_params
    params.permit(PASSED_MESSAGE_PARAMS)
  end
end
