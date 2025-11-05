# Link Checking

This project uses [Lychee](https://lychee.cli.rs/), a fast link checker written in Rust, to detect broken links in blog posts.

## Automated Checking (GitHub Actions)

A GitHub Actions workflow runs automatically:
- **Weekly**: Every Monday at 9:15 AM UTC
- **Manual**: Trigger from the Actions tab

The workflow checks all markdown files in `src/content/blog/` and reports:
- 404 errors (broken links)
- Redirects (3xx status codes)
- Timeouts and SSL issues

Results appear in the workflow summary (non-blocking - won't fail the build).

## Local Checking

### Installation

First, install Lychee on your system:

**macOS:**
```bash
brew install lychee
```

**Linux/macOS (via Rust):**
```bash
cargo install lychee
```

**Other options:** See [official installation docs](https://lychee.cli.rs/#/installation)

### Usage

Once installed, use these npm scripts:

```bash
# Standard check (with 7-day cache)
pnpm check:links

# Verbose output with detailed progress
pnpm check:links:verbose

# Fresh check without cache
pnpm check:links:nocache

# Show installation instructions
pnpm check:links:install
```

### Configuration

**`.lycheeignore`** - Patterns to exclude from checking:
- Social media sites that block bots (Twitter/X, Reddit, etc.)
- Analytics/tracking URLs
- Known broken links
- Paywalls and subscription content
- Local/example URLs

You can add more patterns as needed.

## Future Improvements

Potential enhancements to consider:
- Automatic web.archive.org replacement for broken links
- Create GitHub issues with broken link reports
- Link health dashboard/statistics
- Notification integration (Slack/Discord)

## Workflow File

See `.github/workflows/check-links.yml` for the complete workflow configuration.
