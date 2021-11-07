class MessagesController < ApplicationController
  def save_message
    destination_user = User.find_by(email: message_params[:mail_to])

    new_message = {
      user_from: current_user,
      user_to: destination_user,
      content: message_params[:content],
      message_type: message_params[:type],
      sent_at: message_params[:sent_at]
    }

    Message.create!(new_message)
    messages = Message.where(user_to_id: [destination_user.id, current_user.id], user_from_id: [destination_user.id, current_user.id]).order(:sent_at)

    ActionCable.server.broadcast('messages', { messages: messages})
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
