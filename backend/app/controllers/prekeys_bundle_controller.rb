class PrekeysBundleController < ApplicationController
  def save_prekeys_bundle
    prekeys_bundle_info = {
      identity_key: message_params[:identityKey],
      prekeys: message_params[:preKeys],
      signed_prekey: message_params[:signedPreKey]
    }

    current_user.update(prekeys_bundle_info)
  end

  def send_prekeys_bundle_info
    to_pass = {
      identity_key: current_user.identity_key,
      signed_key: current_user.signed_prekey,
      prekey: current_user.prekeys[0]
    }
    # TODO remove taken prekey
  end

  private PREKEY_BUNDLE_PARAMS = [:identityKey, {preKeys: [:keyId, :publicKey]}, {signedPreKey: [:keyId, :publicKey, :signature]}]

  def message_params
    params.permit(PREKEY_BUNDLE_PARAMS)
  end
end
