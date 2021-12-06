module TestSeed

  def load_test_data
    jarek = User.create!(email: 'jarek@gmail.com', password: 'hasloJarka', activated: true, username: 'Jarek123', otp_secret_key: User.otp_random_secret)
    dawid = User.create!(email: 'dawid@gmail.com', password: 'hasloDawida', activated: true, username: 'Dawid123', otp_secret_key: User.otp_random_secret)
    jacek = User.create!(email: 'jacek@gmail.com', password: 'hasloJacka', activated: true, username: 'Jacek123', otp_secret_key: User.otp_random_secret)
    marco = User.create!(email: 'marco@gmail.com', password: 'haslomarco', activated: true, username: 'marco123', otp_secret_key: User.otp_random_secret)
    maciek = User.create!(email: 'maciek@gmail.com', password: 'haslo', activated: true, username: 'Byk', otp_secret_key: User.otp_random_secret)
    dragon_slayer = User.create!(email: 'dragon@gmail.com', password: 'haslo', activated: true, username: 'DragonSlayer', otp_secret_key: User.otp_random_secret)

    Invitation.create!(inviter: jarek, invitee: jacek, status: 'pending')
    Invitation.create!(inviter: jarek, invitee: dragon_slayer, status: 'accepted')
    Invitation.create!(inviter: marco, invitee: jarek, status: 'pending')
    Invitation.create!(inviter: dawid, invitee: jarek, status: 'accepted')
    Invitation.create!(inviter: dawid, invitee: jacek, status: 'accepted')
    Invitation.create!(inviter: jacek, invitee: dragon_slayer, status: 'pending')
  end
end