class MessagesController < ApplicationController
  def save_message
    current_message_params = message_params[:messages][0]

    sender_user_id = current_user.id
    receiver_user_id = current_message_params[:receiver_id]

    sender_device_id = current_message_params[:sender_device_id]
    receiver_device_id = current_message_params[:receiver_device_id]

    current_device = Device.where(user_id: sender_user_id, in_user_hierarchy_index: sender_device_id).last
    destination_device = Device.where(user_id: receiver_user_id, in_user_hierarchy_index: receiver_device_id).last

    new_message = {
      sender_id: current_device.id,
      receiver_id: destination_device.id,
      content: current_message_params[:content],
      message_type: current_message_params[:type],
      sent_at: current_message_params[:sent_at]
    }

    message = Message.create!(new_message)
    ActionCable.server.broadcast('messages', {
                                   message: {
                                     id: message.id,
                                     content: message.content,
                                     message_type: message.message_type,
                                     sent_at: message.sent_at,
                                     sender: {
                                       user_id: sender_user_id,
                                       device_id: sender_device_id
                                     },
                                     receiver: {
                                       user_id: receiver_user_id,
                                       device_id: receiver_device_id
                                     }
                                   }
                                 })

    render json: { status: :ok, message_id: message.id }

  end

  def find_waiting_messages
    # waiting_messages = Message.where("mail_to = ?", current_user.email)
    waiting_messages = current_user.received_messages
    # TODO wait for confirmation from user?
    waiting_messages.delete_all
  end

  PASSED_MESSAGE_PARAMS = [{messages: [:content, :sender_device_id, :receiver_id, :receiver_device_id, :sent_at, :type]}]

  def message_params
    params.permit(PASSED_MESSAGE_PARAMS)
  end
end
