class MessagesController < ApplicationController

  def get_invalid_devices(receiver_devices, messages)
    invalid_devices = []

    actual_receiver_devices_ids = receiver_devices.collect { |d| d.in_user_hierarchy_index }
    sent_receiver_devices_ids = messages.collect { |m| m[:receiver_device_id] }

    actual_receiver_devices_ids.each do |device|
      if (sent_receiver_devices_ids.include? device) == false
        invalid_devices.push({ device_index: device, reason: :missing })
      end
    end

    sent_receiver_devices_ids.each do |device|
      if (actual_receiver_devices_ids.include? device) == false
        invalid_devices.push({ device_index: device, reason: :outdated })
      end
    end
    return invalid_devices
  end

  def get_invalid_devices_response(receiver_devices, invalid_devices)
    response = []
    invalid_devices.each do |invalid_device|
      if invalid_device[:reason] == :missing
        device_info = receiver_devices.where(in_user_hierarchy_index: invalid_device[:device_index]).last
        response.push({
                        device_id: invalid_device[:device_index],
                        prekey_bundle: {
                          identity_key: device_info.identity_key,
                          signed_key: device_info.signed_prekey,
                          prekey: device_info.prekeys[0]
                        }
                      })
      else
        response.push({ device_id: invalid_device[:device_index] })
      end
    end
    response
  end

  def save_message
    sender_device = Device.where(user_id: current_user.id, in_user_hierarchy_index: message_params[:sender_device_id]).last
    receiver_devices = Device.where(user_id: message_params[:receiver_user_id])

    invalid_devices = get_invalid_devices(receiver_devices, message_params[:messages])

    if invalid_devices.empty?
      new_message = {
        sender_id: sender_device.id,
        receiver_id: receiver_devices[0].id,
        content: message_params[:messages][0][:content],
        message_type: message_params[:messages][0][:type],
        sent_at: message_params[:messages][0][:sent_at]
      }
      created_message = Message.create!(new_message)
      message_params[:messages].each do |message|
        ActionCable.server.broadcast('messages', {
                                       message: {
                                         id: created_message.id,
                                         content: message[:content],
                                         message_type: created_message[:message_type],
                                         sent_at: message[:sent_at],
                                         sender: {
                                           user_id: sender_device.user_id,
                                           device_id: sender_device.in_user_hierarchy_index
                                         },
                                         receiver: {
                                           user_id: message_params[:receiver_user_id],
                                           device_id: message[:receiver_device_id]
                                         }
                                       }
                                     })
      end
      render json: { status: :ok, message_id: created_message.id }
    else
      invalid_devices_response = get_invalid_devices_response(receiver_devices, invalid_devices)
      render json: { status: 202, invalid_devices: invalid_devices_response }
    end
  end

  def find_waiting_messages
    # waiting_messages = Message.where("mail_to = ?", current_user.email)
    waiting_messages = current_user.received_messages
    # TODO wait for confirmation from user?
    waiting_messages.delete_all
  end

  private

  ALLOWED_PARAMS = [:receiver_user_id, :sender_device_id, {messages: [:content, :receiver_device_id, :sent_at, :type]}]

  def message_params
    params.permit(ALLOWED_PARAMS)
  end
end
