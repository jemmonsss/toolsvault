# ToolsVault

A modular Jekyll-based tool vault for developers.

## How to Add a Tool

1. Copy `_tools/example.md` to `_tools/your-tool.md`
2. Edit the frontmatter fields (`title`, `link`, `description`, `tags`, `category`)
3. Commit and push

## Local Development

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000`.

## Deployment

This site is configured to deploy via GitHub Actions to GitHub Pages. Ensure GitHub Pages is set to use the GitHub Actions workflow in repository settings.

## Custom Domain

DNS should point `toolsvault.org` to GitHub Pages using an ALIAS, ANAME, or A record.
