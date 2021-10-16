module TemplateRenderer

  def self.render_email(template_name, variables)
    template = get_email_template(template_name)
    bad_request = template[:variables].any? { |v| variables[v.to_sym].nil? }
    if bad_request
      raise ActionController::BadRequest.new
    end
    {
      message: render_template(template[:message], variables),
      subject: render_template(template[:subject], variables)
    }
  end

  def self.render_template(template, variables)
    variables[:app_url] = Rails.configuration.frontend_url
    Liquid::Template.parse(template).render(variables.deep_stringify_keys)
  end

  def self.get_email_template(template_name)
    JSON.parse(File.read("#{Rails.root}/app/templates/liquid/#{template_name}.json")).symbolize_keys
  end

end