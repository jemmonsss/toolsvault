#!/usr/bin/env ruby
# encoding: UTF-8
# Site validation script for ToolsVault.
# Usage:
#   ruby scripts/check_site.rb frontmatter  # validate _tools front matter
#   ruby scripts/check_site.rb source       # front matter, IDs, assets, JS syntax
#   ruby scripts/check_site.rb links        # validate internal links in _site

require 'yaml'
require 'pathname'
require 'set'
require 'tempfile'
require 'open3'

ROOT = Pathname.new(__dir__).parent.expand_path
TOOLS_DIR = ROOT.join('_tools')
SITE_DIR = ROOT.join('_site')

def read_utf8(path)
  File.read(path, encoding: 'UTF-8')
rescue Encoding::InvalidByteSequenceError, Encoding::UndefinedConversionError => e
  raise "#{Pathname.new(path).relative_path_from(ROOT)} is not valid UTF-8: #{e.message}"
end

def relative(path)
  Pathname.new(path).relative_path_from(ROOT).to_s
end

def parse_frontmatter(file, errors)
  content = read_utf8(file)
  unless content.start_with?("---\n", "---\r\n")
    errors << "#{relative(file)}: missing YAML front matter"
    return [{}, content]
  end

  match = content.match(/\A---\s*\r?\n(.*?)\r?\n---\s*\r?\n/m)
  unless match
    errors << "#{relative(file)}: front matter is not closed with ---"
    return [{}, content]
  end

  begin
    data = YAML.safe_load(match[1], permitted_classes: [], aliases: false)
  rescue Psych::Exception => e
    errors << "#{relative(file)}: invalid YAML front matter (#{e.message.lines.first.strip})"
    return [{}, content]
  end

  unless data.is_a?(Hash)
    errors << "#{relative(file)}: front matter must be a mapping"
    return [{}, content]
  end
  [data, content[match.end(0)..] || '']
rescue StandardError => e
  errors << e.message
  [{}, '']
end

def frontmatter_errors
  errors = []
  unless TOOLS_DIR.directory?
    return ['No _tools directory found.']
  end

  seen_titles = {}
  seen_links = {}
  files = Dir.glob(TOOLS_DIR.join('*.md')).sort
  files.each do |file|
    data, = parse_frontmatter(file, errors)
    next if data.empty?

    %w[title description category].each do |key|
      errors << "#{relative(file)}: missing or empty '#{key}'" if data[key].to_s.strip.empty?
    end

    tags = data['tags']
    unless tags.is_a?(Array) && tags.any? && tags.all? { |tag| tag.is_a?(String) && !tag.strip.empty? }
      errors << "#{relative(file)}: 'tags' must be a non-empty list of strings"
    end

    slug = File.basename(file, '.md')
    expected_link = "/tools/#{slug}/"
    link = data['link'].to_s
    errors << "#{relative(file)}: 'link' should be #{expected_link.inspect}" unless link == expected_link

    title_key = data['title'].to_s.strip.downcase
    if !title_key.empty? && seen_titles.key?(title_key)
      errors << "#{relative(file)}: duplicate title also used by #{seen_titles[title_key]}"
    else
      seen_titles[title_key] = relative(file) unless title_key.empty?
    end

    unless link.empty?
      if seen_links.key?(link)
        errors << "#{relative(file)}: duplicate link also used by #{seen_links[link]}"
      else
        seen_links[link] = relative(file)
      end
    end
  end
  errors
end

def node_available?
  system('node', '--version', out: File::NULL, err: File::NULL)
end

def source_errors
  errors = frontmatter_errors
  node_ok = node_available?
  errors << 'Node.js is unavailable; inline JavaScript syntax could not be checked.' unless node_ok

  Dir.glob(TOOLS_DIR.join('*.md')).sort.each do |file|
    _, body = parse_frontmatter(file, errors)

    ids = body.scan(/\bid\s*=\s*["']([^"']+)["']/i).flatten
    ids.tally.each do |id, count|
      errors << "#{relative(file)}: duplicate HTML id #{id.inspect} (#{count} occurrences)" if count > 1
    end

    body.scan(%r{<script\b(?![^>]*\bsrc\s*=)[^>]*>(.*?)</script>}mi).each_with_index do |match, index|
      js = match[0]
      next if js.strip.empty? || js.include?('{{') || js.include?('{%') || !node_ok
      Tempfile.create(['toolsvault-inline-', '.js']) do |tmp|
        tmp.write(js)
        tmp.flush
        _stdout, stderr, status = Open3.capture3('node', '--check', tmp.path)
        unless status.success?
          detail = stderr.lines.grep(/SyntaxError|Unexpected|ReferenceError/).first || stderr.lines.last
          errors << "#{relative(file)}: inline script #{index + 1} has invalid JavaScript (#{detail.to_s.strip})"
        end
      end
    end

    body.scan(/(?:href|src)\s*=\s*["'](\/assets\/[^"']+)["']/i).flatten.each do |asset|
      clean = asset.split('?').first.split('#').first
      next if clean.include?('{{') || clean.include?('{%')
      target = ROOT.join(clean.sub(%r{^/}, ''))
      errors << "#{relative(file)}: missing asset #{clean}" unless target.file?
    end
  end

  errors
end

def resolve_site_target(path)
  clean = path.sub(%r{^/}, '')
  direct = SITE_DIR.join(clean)
  return direct if direct.file?
  return direct.join('index.html') if direct.directory?
  return SITE_DIR.join(clean, 'index.html') if path.end_with?('/')
  html = SITE_DIR.join("#{clean}.html")
  return html if html.file?
  direct
end

def link_errors
  return ['No _site directory found; run the Jekyll build before checking links.'] unless SITE_DIR.directory?

  errors = []
  Dir.glob(SITE_DIR.join('**', '*.html')).sort.each do |html|
    raw = read_utf8(html)
    content = raw.gsub(%r{<script\b[^>]*>.*?</script>}mi, '').gsub(%r{<style\b[^>]*>.*?</style>}mi, '')
    content.scan(/(?:href|src)\s*=\s*["']([^"']+)["']/i) do |match|
      url = match[0]
      next if url.start_with?('#', 'mailto:', 'tel:', 'http://', 'https://', '//', 'data:', 'javascript:')

      path = url.split('#').first.split('?').first
      next if path.empty?
      target = resolve_site_target(path)
      errors << "#{relative(html)}: broken link -> #{url}" unless target.exist?
    end
  end
  errors
rescue StandardError => e
  [e.message]
end

def report(label, errors, success)
  if errors.any?
    puts "#{label} failed:"
    errors.uniq.each { |error| puts "  - #{error}" }
    false
  else
    puts success
    true
  end
end

command = ARGV[0]
ok = case command
     when 'frontmatter'
       count = Dir.glob(TOOLS_DIR.join('*.md')).count
       report('Front matter validation', frontmatter_errors, "Front matter OK (#{count} tools checked)")
     when 'source'
       count = Dir.glob(TOOLS_DIR.join('*.md')).count
       report('Source validation', source_errors, "Source validation OK (#{count} tools checked)")
     when 'links'
       report('Internal link validation', link_errors, 'Internal link check OK')
     else
       puts "Unknown command: #{command}\nUsage: ruby scripts/check_site.rb [frontmatter|source|links]"
       false
     end
exit(ok ? 0 : (command ? 1 : 2))
