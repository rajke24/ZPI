# frozen_string_literal: true

class Ability
  include CanCan::Ability

  def initialize(user)
    if user.present?

    end
  end
end
