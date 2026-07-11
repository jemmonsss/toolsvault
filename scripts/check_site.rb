#!/usr/bin/env ruby
# Site validation script for ToolsVault.
# Usage:
#   ruby scripts/check_site.rb frontmatter   # validate _tools front matter
#   ruby scripts/check_site.rb links         # validate internal links in _site

require 'yaml'
require 'pathname'

def check_frontmatter
  tools_dir = Pathname.new('_tools')
  unless tools_dir.directory?
    puts 'No _tools directory found.'
    return
  end

  errors = []
  files = Dir.glob(tools_dir.join('*.md')).sort
  files.each do |file|
    content = File.read(file)
    next unless content.start_with?('---')

    fm = content.split(/^---\s*$/)[1]
    data = YAML.safe_load(fm, permitted_classes: []) rescue nil
    next unless data.is_a?(Hash)

    %w[title description category].each do |key|
      errors << "#{file.relative_path}: missing or empty '#{key}'" if data[key].to_s.strip.empty?
    end

    tags = data['tags']
    errors << "#{file.relative_path}: 'tags' must be a non-empty list" unless tags.is_a?(Array) && !tags.empty?
  end

  if errors.any?
    puts 'Front matter validation failed:'
    errors.each { |e| puts "  - #{e}" }
    exit 1
  else
    puts "Front matter OK (#{files.count} tools checked)"
  end
end

def check_links
  site = Pathname.new('_site')
  unless site.directory?
    puts 'No _site directory found; skipping link check.'
    return
  end

  errors = []
  Dir.glob(site.join('**', '*.html')).each do |html|
    content = File.read(html)
    content.scan(/(?:href|src)="([^"]+)"/) do |match|
      url = match[0]
      next if url.start_with?('#', 'mailto:', 'http://', 'https://', '//', 'data:')

      path = url.split('#').first.split('?').first
      next if path.empty? || path.end_with?('/')

      target = site.join(path.sub(%r{^/}, ''))
      errors << "#{html.relative_path}: broken link -> #{url}" unless File.exist?(target)
    end
  end

  if errors.any?
    puts 'Broken internal links found:'
    errors.each { |e| puts "  - #{e}" }
    exit 1
  else
    puts 'Internal link check OK'
  end
end

case ARGV[0]
when 'frontmatter'
  check_frontmatter
when 'links'
  check_links
else
  puts "Unknown command: #{ARGV[0]}\nUsage: ruby scripts/check_site.rb [frontmatter|links]"
  exit 2
end
