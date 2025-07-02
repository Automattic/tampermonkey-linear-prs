# Linear GitHub Integration Tampermonkey Script

*An official Automattic userscript for seamless Linear + GitHub integration*

A powerful userscript that seamlessly integrates Linear with GitHub pull requests, enabling one-click Linear issue creation directly from GitHub PRs.

## 🚀 Features

### 📋 Create Linear Issues from GitHub PRs
- **One-click issue creation** directly from GitHub PR pages using Linear's official API
- **Automatic PR title linking** with Linear issue ID format (`[ABC-123] PR Title`)
- **Smart description handling** with markdown preservation and section filtering
- **Team and project selection** through intuitive settings interface

### 🔗 Intelligent Link Detection
- **Auto-detects existing links** using all Linear magic words
- **Supports all Linear magic words**: `fixes`, `closes`, `resolves`, `related to`, `part of`, etc.
- **Handles multiple formats**: bare IDs (`Fixes ABC-123`), markdown links (`Fixes [ABC-123](URL)`), and bracket notation (`[ABC-123]`)
- **Prevents duplicate issues** when links already exist

### ⚙️ Flexible Configuration
- **First section only option**: Extract just the main description section (great for long PRs)
- **Dark mode interface** perfectly matching GitHub's design language
- **Persistent settings** with secure token storage
- **Team/subteam support** with automatic loading and filtering

### 🎯 Smart Features
- **Link detection**: Button changes to "Open Linear Issue" when a PR is already linked
- **Error handling**: Clear error messages and troubleshooting guidance
- **Console debugging**: Detailed logging for development and troubleshooting

## 🛠️ Installation

### Step 1: Install Tampermonkey
1. **Chrome/Edge**: [Tampermonkey Chrome Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. **Firefox**: [Tampermonkey Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
3. **Safari**: [Tampermonkey Safari Extension](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### Step 2: Install the Script

#### Option A: Direct Installation (Recommended)
Click the installation link:

🔥 **[Install Linear GitHub API Integration](https://github.com/Automattic/tampermonkey-linear-prs/raw/main/linear-github-api.user.js)**

#### Option B: Manual Installation
1. Open Tampermonkey Dashboard
2. Click the **"+"** tab to create a new script
3. Copy the script content from this repository
4. Paste it into the editor
5. Save with **Ctrl+S** (or **Cmd+S** on Mac)

## ⚡ Quick Setup (API Version)

### 1. Get Your Linear API Key
1. Go to **[Linear.app](https://linear.app)** and log in
2. Click your **avatar → Settings**
3. In the left sidebar, click **API**
4. Click **Create new API key**
5. Name it `GitHub Integration`
6. **Copy the key** (starts with `lin_api_`)

### 2. Configure the Script
1. Navigate to any **GitHub PR page**
2. Scroll down to see the **Linear Integration** section
3. Click **⚙️ Settings**
4. Paste your **API key**
5. Select your **team**
6. **Save Settings**

### 3. Create Your First Issue
1. Click **➕ Create Linear Issue**
2. The issue will be created automatically
3. Your PR title will be updated with the Linear ID
4. Done! 🎉

## 💡 Usage Examples

### Creating a Linear Issue
```markdown
Before: "Fix user authentication bug"
After:  "[ABC-123] Fix user authentication bug"
```

### Automatic Link Detection
The script detects existing links in these formats:

- **Magic words**: `Fixes ABC-123`, `Resolves ABC-123`
- **Markdown links**: `Fixes [ABC-123](https://linear.app/team/issue/ABC-123)`
- **Bracket format**: `[ABC-123] in PR title`

### Settings Options
- ✅ **Auto-update PR title**: Automatically add Linear ID to PR title
- ✅ **First section only**: Include only the main description section
- ✅ **Team selection**: Choose which Linear team to create issues in

## 🔧 Advanced Configuration

### First Section Only
Enable this option to include only the first heading and content below it:

```markdown
## Overview          ← Included
Main description     ← Included

### Details          ← Included (sub-heading)
Implementation       ← Included

## Testing           ← Excluded
Test instructions    ← Excluded
```

### Team and Project Settings
- **Teams**: Script loads all teams you have access to, including subteams
- **Projects**: Optionally assign issues to specific projects
- **Persistent**: Settings are saved between sessions

## 🐛 Troubleshooting

### Script Not Working?
1. **Check Console**: Open Developer Tools (F12) and look for `[Linear]` messages
2. **Refresh Page**: Sometimes GitHub's dynamic loading interferes
3. **Check Settings**: Ensure API key and team are configured

### Can't See Your Team?
- **Check API Key**: Make sure it's valid and starts with `lin_api_`
- **Check Permissions**: Ensure you have access to the team in Linear
- **Reload Teams**: Re-enter your API key to refresh the team list

### Issues Not Creating?
1. **API Key Valid**: Check if the key is correctly entered
2. **Team Selected**: Ensure you've selected a team in settings
3. **Console Errors**: Look for detailed error messages in the console

### Common Error Messages
- `"Missing required fields"` → Select a team in settings
- `"Invalid API key"` → Check your Linear API key
- `"Could not find edit button"` → GitHub UI changed, try refreshing

## 📋 What's New

Check out the [CHANGELOG.md](CHANGELOG.md) for detailed release notes and feature updates.

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Reporting Issues
- 🐛 **Bug Reports**: [Create an Issue](https://github.com/Automattic/tampermonkey-linear-prs/issues)
- 💡 **Feature Requests**: [Start a Discussion](https://github.com/Automattic/tampermonkey-linear-prs/discussions)

### Development
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly on real GitHub PRs
5. **Submit** a pull request

### Testing Checklist
- [ ] Script loads without console errors
- [ ] Settings dialog opens and saves properly
- [ ] Linear API key validation works
- [ ] Team selection loads correctly
- [ ] Issue creation succeeds with proper title/description
- [ ] PR title updates automatically
- [ ] Link detection works for all supported formats
- [ ] "First section only" option functions correctly

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Linear Team** for the excellent API and comprehensive documentation
- **GitHub** for the robust platform and developer-friendly interface
- **Tampermonkey** for making userscripts possible and reliable
- **Open Source Community** for feedback, testing, and contributions

## 📚 Resources

- **[Linear API Documentation](https://linear.app/docs/api)** - Complete API reference
- **[Linear GitHub Integration](https://linear.app/docs/github)** - Official integration guide
- **[GitHub Magic Words](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)** - Linking syntax reference
- **[Tampermonkey Documentation](https://www.tampermonkey.net/documentation.php)** - Userscript development guide

---

**⭐ If this script helps streamline your workflow, please consider giving it a star!**

*Built by Automattic for seamless Linear + GitHub integration*