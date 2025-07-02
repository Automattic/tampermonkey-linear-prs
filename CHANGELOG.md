# Changelog

All notable changes to the Linear GitHub API Integration script will be documented in this file.

## [1.2.0] - 2025-07-02

### Added
- Enhanced Linear magic words detection for all supported keywords
- Markdown link format detection (`Fixes [ABC-123](URL)`)
- "First section only" option for PR descriptions
- Comprehensive console debugging with `[Linear Detection]` messages
- Dark mode settings interface matching GitHub's theme
- Automatic team/subteam loading and filtering
- Better error handling and user-friendly error messages

### Changed
- Improved link detection to handle bracket format, bare IDs, and markdown links
- Enhanced settings dialog with better contrast and layout
- Updated API integration to use Linear's official GraphQL API
- Renamed file to `linear-github-api.user.js` following Tampermonkey conventions

### Fixed
- Configuration initialization order to prevent null reference errors
- Selective div element exclusion in markdown conversion
- Cross-tab communication reliability issues
- PR title update functionality with improved DOM selectors

## [1.1.0] - 2025-07-01

### Added
- Linear API integration for reliable issue creation
- Automatic PR title updating with Linear issue IDs
- Settings persistence and team selection
- Link detection and prevention of duplicate issues

### Changed
- Migrated from `linear.new` URL approach to full API integration
- Improved user interface with better styling

## [1.0.0] - 2025-06-30

### Added
- Initial release with basic Linear integration
- Simple `linear.new` URL generation
- Basic PR description extraction
- Tampermonkey script foundation