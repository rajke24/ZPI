class MessagesController < ApplicationController
  def save_message
    destination_user = User.find_by(id: message_params[:receiver_id])
    p current_user
    p destination_user

    new_message = {
      sender: current_user,
      receiver: destination_user,
      content: message_params[:content],
      message_type: message_params[:type],
      sent_at: message_params[:sent_at]
    }

    Message.create!(new_message)
    message = Message.where(receiver_id: [destination_user.id, current_user.id], sender_id: [destination_user.id, current_user.id]).order(:sent_at).last

    ActionCable.server.broadcast('messages', { message: message })

    render json: {status: :ok, message_id: message.id}

  end

  def find_waiting_messages
    # waiting_messages = Message.where("mail_to = ?", current_user.email)
    waiting_messages = current_user.received_messages
    # TODO wait for confirmation from user?
    waiting_messages.delete_all
  end

  PASSED_MESSAGE_PARAMS = [:content, :receiver_id, :sent_at, :type]

  def message_params
    params.permit(PASSED_MESSAGE_PARAMS)
  end
end
