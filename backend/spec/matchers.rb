# frozen_string_literal: true
require 'fileutils'

module Matchers
  class MatchSnapShot
    attr_reader :actual, :expected, :extension

    def initialize(metadata, snapshot_name, extension)
      @metadata = metadata
      @snapshot_name = snapshot_name
      @extension = extension
    end

    def matches?(actual)
      @actual = actual
      if valid_json?(actual)
        @actual = cleanup_response(actual)
      end

      filename = "#{@snapshot_name}.#{@extension}"
      snap_path = File.join(snapshot_dir, filename)
      FileUtils.mkdir_p(File.dirname(snap_path)) unless Dir.exist?(File.dirname(snap_path))
      rebuild_snapshots = ENV.fetch('REBUILD_SNAPSHOTS', false).to_s == 'true'
      if File.exist?(snap_path) && !rebuild_snapshots
        file = File.new(snap_path)
        @expected = file.read
        file.close
        if valid_json?(@expected)
          @expected = JSON.pretty_generate(JSON.parse(@expected))
        elsif extension == 'html'
          @expected = cleanup_html(@expected)
        end
        @actual == @expected
      else
        RSpec.configuration.reporter.message "Generate #{snap_path}"
        file = File.new(snap_path, 'w+')
        file.write(@actual)
        file.close
        true
      end
    end

    def valid_json?(json)
      JSON.parse(json)
      true
    rescue JSON::ParserError => e
      false
    end

    def diffable?
      true
    end

    def failure_message
      "\nexpected: #{@expected}\n     got: #{@actual}\n"
    end

    def snapshot_dir
      File.dirname(@metadata[:file_path]) << '/__snapshots__'
    end

    private

    def cleanup_response(actual)
      JSON.pretty_generate(JSON.parse(actual)).gsub(/"id":\s*\d+/, '"id": "ANY"')
          .gsub(/"id\\":\s*\d+/, '"id": "ANY"')
          .gsub(/"created_at":\s"(.*)"/, '"created_at": "ANY"')
          .gsub(/"token":\s"(.*)"/, '"token": "ANY"')
          .gsub(/"color":\s"(.*)"/, '"color": "ANY"')
    end
  end

  def match_snapshot(snapshot_name, extension = 'json')
    MatchSnapShot.new(self.class.metadata, snapshot_name, extension)
  end
end
