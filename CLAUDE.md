# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tampermonkey userscript for integrating Linear with GitHub PRs. The script adds functionality to create Linear issues directly from GitHub PR pages using Linear's API.

## Codebase Architecture

### Core Script Structure (linear-github-api.user.js:1-1209)

**Main Components:**
- **Configuration Management** (lines 262-278): Handles persistent storage of user settings including API key, team selection, and preferences using GM_getValue/GM_setValue
- **UI Integration** (lines 280-309): Injects buttons and interface elements into GitHub PR pages via DOM manipulation  
- **Linear Detection** (lines 311-405): Smart detection of existing Linear issue links using multiple patterns (bracket format, magic words, markdown links)
- **API Integration** (lines 474-561): Direct Linear GraphQL API calls for issue creation with proper error handling
- **PR Automation** (lines 563-840): Automatic PR title and description updates with Linear issue IDs

**Key Technical Patterns:**
- **DOM Observation**: Uses MutationObserver to detect GitHub's dynamic content loading
- **GraphQL Integration**: Full Linear API integration with team/project support
- **Markdown Processing**: Custom HTML-to-Markdown converter with Linear-specific filtering
- **Cross-tab Communication**: Persistent settings and state management

### Linear Integration Approach

The script uses **Linear's official API** (not linear.new URLs) for reliable issue creation:
- GraphQL mutations for issue creation
- Team and project selection support
- Automatic PR linking with configurable magic words
- Smart duplicate detection to prevent multiple issues

### Current Development Context

**User Request**: Implement "Add to Linear" links using linear.new intent structure similar to jetpack-live-branches.js pattern. This represents a shift from the current API-based approach to a simpler URL-based approach.

**Important Considerations:**
- Current script uses full API integration vs. requested linear.new intent approach
- Need to understand linear.new intent structure from https://linear.app/developers/create-issues-using-linear-new
- Should evaluate whether to replace API approach or provide both options

## Key Functional Areas

### Link Detection System (lines 311-405)
Detects existing Linear issues using:
- Bracket format: `[ABC-123]` in PR titles
- Magic words: `Fixes ABC-123`, `Closes ABC-123`, etc.
- Markdown links: `Fixes [ABC-123](URL)`

### Settings Management (lines 842-968)
- Modal-based settings interface
- API key management with secure storage
- Team selection with automatic loading
- Persistent configuration across sessions

### PR Description Processing (lines 1046-1189)
- HTML-to-Markdown conversion
- "First section only" filtering option
- Linear integration section exclusion
- Comprehensive markdown format support

## Development Notes

- **No build system**: Single JavaScript file deployment
- **No tests**: Manual testing on GitHub PR pages required
- **Tampermonkey-specific**: Uses GM_* APIs for cross-origin requests and storage
- **GitHub DOM dependency**: Relies on GitHub's specific DOM structure and CSS selectors