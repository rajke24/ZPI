class PrekeysBundleController < ApplicationController
  def save_prekeys_bundle
    user_devices = Device.where(user_id: current_user.id)
    new_device = Device.create(user_id: current_user.id, in_user_hierarchy_index: user_devices.length + 1) #TODO account for deleting devices

    prekeys_bundle_info = {
      identity_key: save_prekeys_bundle_message_params[:identityKey],
      prekeys: save_prekeys_bundle_message_params[:preKeys],
      signed_prekey: save_prekeys_bundle_message_params[:signedPreKey]
    }
    new_device.update(prekeys_bundle_info)
    render json: { status: :ok, device_id: new_device.in_user_hierarchy_index }

  end

  def save_prekeys_bundle_message_params
    params.permit(PREKEY_BUNDLE_PUT_PARAMS)
  end

  def send_prekeys_bundle_info
    destination_device = Device.find_by(user_id: get_prekey_bundle_message_params[:id])

    to_pass = {
      identity_key: destination_device.identity_key,
      signed_key: destination_device.signed_prekey,
      prekey: destination_device.prekeys[0]
    }
    render json: to_pass
    # TODO remove taken prekey
  end

  def get_prekey_bundle_message_params
    params.permit(PREKEY_BUNDLE_GET_PARAMS)
  end

  private
  PREKEY_BUNDLE_PUT_PARAMS = [:identityKey, { preKeys: [:keyId, :publicKey]}, { signedPreKey: [:keyId, :publicKey, :signature]}]
  PREKEY_BUNDLE_GET_PARAMS = [:id]

end
