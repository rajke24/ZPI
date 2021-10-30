class Mailer < ApplicationMailer

  def send_user_email(email_address, variables)
    email = TemplateRenderer.render_email('new_user', variables)
    send_email(email_address, email[:subject], email[:message])
  end

  def send_password_reset_mail(email_address, variables)
    email = TemplateRenderer.render_email('password_reset', variables)
    send_email(email_address, email[:subject], email[:message])
  end

  def send_two_factor_auth_mail(email_address, variables)
    email = TemplateRenderer.render_email('two_factor_auth_code', variables)
    send_email(email_address, email[:subject], email[:message])
  end

  def send_email(recipient, subject, body)
    mail(
      to: recipient,
      subject: subject,
      body: body,
      content_type: "text/html",
    )
  end
end