class PrekeysBundleController < ApplicationController
  def save_prekeys_bundle
    prekeys_bundle_info = {
      identity_key: save_prekeys_bundle_message_params[:identityKey],
      prekeys: save_prekeys_bundle_message_params[:preKeys],
      signed_prekey: save_prekeys_bundle_message_params[:signedPreKey]
    }

    current_user.update(prekeys_bundle_info)
  end

  def save_prekeys_bundle_message_params
    params.permit(PREKEY_BUNDLE_PUT_PARAMS)
  end

  def send_prekeys_bundle_info
    destination_user = User.find_by(id: get_prekey_bundle_message_params[:id])

    to_pass = {
      identity_key: destination_user.identity_key,
      signed_key: destination_user.signed_prekey,
      prekey: destination_user.prekeys[0]
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
