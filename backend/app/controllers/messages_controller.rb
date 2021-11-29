class MessagesController < ApplicationController
  def save_message
    current_device = Device.find_by(user_id: current_user.id)
    destination_device = Device.find_by(user_id: message_params[:receiver_id])

    new_message = {
      sender_id: current_device.user_id,
      receiver_id: destination_device.user_id,
      content: message_params[:content],
      message_type: message_params[:type],
      sent_at: message_params[:sent_at]
    }

    message = Message.create!(new_message)
    ActionCable.server.broadcast('messages', { message: message })

    render json: { status: :ok, message_id: message.id }

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
