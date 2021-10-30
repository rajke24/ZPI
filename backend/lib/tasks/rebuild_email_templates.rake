namespace :email_templates do
  desc "Rebuild email templates"
  task :rebuild do

    templates = [
      {
        subject: 'Welcome on ByeSpy',
        filename: 'new_user',
        illustration: 'new_user.png',
        variables: [:recipient_name, :link]
      },
      {
        subject: 'Password reset requested',
        filename: 'password_reset',
        illustration: 'password_reset.png',
        variables: [:link]
      }
    ]

    templates.map do |template|
      layout = File.read("#{Rails.root}/app/templates/erb/_layout.html.erb")
      template_body = File.read("#{Rails.root}/app/templates/erb/#{template[:filename]}.html.erb")
      if template[:illustration]
        message = ERB.new(layout.gsub('CONTENT', template_body).gsub('ILLUSTRATION', template[:illustration])).result
      else
        message = ERB.new(template_body).result
      end
      file = File.new("#{Rails.root}/app/templates/liquid/#{template[:filename]}.json", "w+")
      file.write(JSON.pretty_generate({ subject: template[:subject], message: message.strip, variables: template[:variables] }))
      file.close
    end
  end
end