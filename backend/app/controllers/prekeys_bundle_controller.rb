class PrekeysBundleController < ApplicationController
  def save_prekeys_bundle
    user_devices = Device.where(user_id: current_user.id)
    new_device = Device.create(user_id: current_user.id, in_user_hierarchy_index: user_devices.length + 1) #TODO account for deleting devices

    prekeys_bundle_info = {
      identity_key: prekey_bundle_params[:identityKey],
      prekeys: prekey_bundle_params[:preKeys],
      signed_prekey: prekey_bundle_params[:signedPreKey]
    }
    new_device.update(prekeys_bundle_info)
    render json: { status: :ok, device_id: new_device.in_user_hierarchy_index }
  end

  def send_prekeys_bundle_info
    destination_device = Device.find_by(user_id: prekey_bundle_params[:user_id], in_user_hierarchy_index: prekey_bundle_params[:device_id])

    to_pass = {
      identity_key: destination_device.identity_key,
      signed_key: destination_device.signed_prekey,
      prekey: destination_device.prekeys[0]
    }
    render json: to_pass
    # TODO remove taken prekey
  end

  private

  ALLOWED_PARAMS = [:user_id, :device_id, :identityKey, { preKeys: [:keyId, :publicKey]}, { signedPreKey: [:keyId, :publicKey, :signature]}]

  def prekey_bundle_params
    params.permit(ALLOWED_PARAMS)
  end
end
