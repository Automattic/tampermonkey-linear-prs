// ==UserScript==
// @name         Linear GitHub API Integration
// @namespace    https://github.com/Automattic/tampermonkey-linear-prs/
// @version      1.2.0
// @description  Create Linear issues directly from GitHub PRs with full automation via Linear API
// @author       Automattic
// @match        https://github.com/*/*/pull/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @homepage     https://github.com/Automattic/tampermonkey-linear-prs
// @supportURL   https://github.com/Automattic/tampermonkey-linear-prs/issues
// @downloadURL  https://github.com/Automattic/tampermonkey-linear-prs/raw/main/linear-github-api.user.js
// @updateURL    https://github.com/Automattic/tampermonkey-linear-prs/raw/main/linear-github-api.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const LINEAR_API_URL = 'https://api.linear.app/graphql';
    const markdownBodySelector = '.pull-discussion-timeline .markdown-body';

    // Add styles
    GM_addStyle(`
        .linear-api-integration {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e1e4e8;
        }
        
        .linear-api-button {
            display: inline-block;
            padding: 6px 12px;
            background-color: #5E6AD2;
            color: white;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: background-color 0.2s;
        }
        
        .linear-api-button:hover {
            background-color: #4E5AC2;
        }
        
        .linear-api-button:disabled {
            background-color: #94a3b8;
            cursor: not-allowed;
        }
        
        .linear-settings {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #0d1117;
            padding: 28px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
            z-index: 10000;
            max-width: 550px;
            width: 90%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 1px solid #30363d;
        }
        
        .linear-settings h3 {
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
            color: #f0f6fc;
            border-bottom: 2px solid #5E6AD2;
            padding-bottom: 8px;
        }
        
        .linear-settings .field-group {
            margin-bottom: 20px;
        }
        
        .linear-settings label {
            display: block;
            font-weight: 600;
            color: #f0f6fc;
            margin-bottom: 6px;
            font-size: 14px;
        }
        
        .linear-settings input, .linear-settings select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #30363d;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 14px;
            transition: border-color 0.2s, box-shadow 0.2s;
            background: #21262d;
            color: #f0f6fc;
        }
        
        .linear-settings input:focus, .linear-settings select:focus {
            outline: none;
            border-color: #5E6AD2;
            box-shadow: 0 0 0 3px rgba(94, 106, 210, 0.3);
        }
        
        .linear-settings .help-text {
            font-size: 12px;
            color: #8b949e;
            margin-top: 4px;
            line-height: 1.4;
        }
        
        .linear-settings .api-key-help {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 12px;
            margin-top: 8px;
        }
        
        .linear-settings .api-key-help > strong {
            color: #f0f6fc;
            display: block;
            margin-bottom: 6px;
        }
        
        .linear-settings .api-key-steps strong {
            color: #f0f6fc;
            display: inline;
            font-weight: 600;
        }
        
        .linear-settings .api-key-steps {
            color: #c9d1d9;
            font-size: 13px;
            line-height: 1.5;
        }
        
        .linear-settings .api-key-steps ol {
            margin: 8px 0;
            padding-left: 20px;
        }
        
        .linear-settings .api-key-steps li {
            margin-bottom: 4px;
        }
        
        .linear-settings .api-key-steps code {
            background: #30363d;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, monospace;
            font-size: 12px;
            color: #79c0ff;
        }
        
        .linear-settings .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
        }
        
        .linear-settings .checkbox-group input[type="checkbox"] {
            width: auto;
            margin: 0;
            accent-color: #5E6AD2;
        }
        
        .linear-settings .checkbox-group label {
            margin: 0;
            font-weight: normal;
            color: #c9d1d9;
        }
        
        .linear-settings-buttons {
            margin-top: 24px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            border-top: 1px solid #30363d;
            padding-top: 20px;
        }
        
        .linear-settings-buttons .linear-api-button {
            padding: 8px 16px;
            font-size: 14px;
            min-width: 80px;
            border: 1px solid #30363d;
        }
        
        .linear-settings-buttons .linear-api-button:hover {
            background-color: #4E5AC2 !important;
            border-color: #4E5AC2;
        }
        
        .linear-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .linear-notification.success {
            background-color: #28a745;
        }
        
        .linear-notification.error {
            background-color: #dc3545;
        }
        
        .linear-notification.info {
            background-color: #007bff;
        }
    `);

    // Initialize
    let linearConfig = null;
    let teams = [];

    // Watch for DOM changes
    const observer = new MutationObserver(list => {
        for (const m of list) {
            for (const n of m.addedNodes) {
                if ((n.matches && n.matches(markdownBodySelector)) ||
                    (n.querySelector && n.querySelector(markdownBodySelector))) {
                    addLinearButton();
                    return;
                }
            }
        }
    });
    observer.observe(document, { subtree: true, childList: true });

    // Load config first, then add button
    loadConfig();
    addLinearButton();

    function loadConfig() {
        linearConfig = {
            apiKey: GM_getValue('linear_api_key', ''),
            defaultTeamId: GM_getValue('linear_default_team', ''),
            defaultProjectId: GM_getValue('linear_default_project', ''),
            autoUpdate: GM_getValue('linear_auto_update', true),
            firstSectionOnly: GM_getValue('linear_first_section_only', false)
        };
    }

    function saveConfig() {
        GM_setValue('linear_api_key', linearConfig.apiKey);
        GM_setValue('linear_default_team', linearConfig.defaultTeamId);
        GM_setValue('linear_default_project', linearConfig.defaultProjectId);
        GM_setValue('linear_auto_update', linearConfig.autoUpdate);
        GM_setValue('linear_first_section_only', linearConfig.firstSectionOnly);
    }

    function addLinearButton() {
        const markdownBody = document.querySelector(markdownBodySelector);
        if (!markdownBody || markdownBody.querySelector('.linear-api-integration')) {
            return;
        }

        const section = document.createElement('div');
        section.className = 'linear-api-integration';
        section.innerHTML = `
            <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Linear Integration (API)</h3>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button class="linear-api-button" id="create-linear-issue">
                    ➕ Create Linear Issue
                </button>
                <button class="linear-api-button" id="linear-settings" style="background-color: #6b7280;">
                    ⚙️ Settings
                </button>
            </div>
            <div id="linear-status" style="margin-top: 8px; font-size: 12px; color: #6b7280;"></div>
        `;

        markdownBody.appendChild(section);

        // Add event listeners
        document.getElementById('create-linear-issue').addEventListener('click', createLinearIssue);
        document.getElementById('linear-settings').addEventListener('click', showSettings);

        // Check if already linked
        checkExistingLink();
    }

    function getPRDescriptionForDetection() {
        // This function gets the full description for detection purposes, ignoring firstSectionOnly
        const firstComment = document.querySelector('.comment-body');
        if (!firstComment) return '';

        const clone = firstComment.cloneNode(true);
        
        // Remove the Linear integration section and everything after it
        const linearSection = clone.querySelector('.linear-api-integration');
        if (linearSection) {
            // Remove the Linear section itself
            linearSection.remove();
        }
        
        // Also remove any previous Linear integration sections
        const oldLinearSections = clone.querySelectorAll('#linear-github-integration, .linear-github-integration');
        oldLinearSections.forEach(section => section.remove());

        return htmlToMarkdown(clone); // Return full description without firstSectionOnly filter
    }

    function checkExistingLink() {
        const title = getPRTitle();
        // For detection purposes, always get the full description without firstSectionOnly filter
        const fullDescription = getPRDescriptionForDetection();
        
        console.log('[Linear Detection] Checking for existing links...');
        console.log('[Linear Detection] Title:', title);
        console.log('[Linear Detection] Full Description (for detection):', fullDescription);
        
        let linkedIssueId = null;
        
        // Check for Linear issue ID in title with bracket format [ABC-123]
        const titlePattern = /\[([A-Z]+-\d+)\]/;
        const titleMatch = title.match(titlePattern);
        
        if (titleMatch) {
            linkedIssueId = titleMatch[1];
            console.log('[Linear Detection] Found bracket format in title:', linkedIssueId);
        } else {
            // Check for magic words with Linear issue IDs in title or description
            const fullText = `${title}\n${fullDescription}`;
            
            // Pattern for magic words with bare issue IDs (e.g., "Fixes HOG-14")
            const bareIdPatterns = [
                /(?:close|closes|closed|closing)\s+([A-Z]+-\d+)/gi,
                /(?:fix|fixes|fixed|fixing)\s+([A-Z]+-\d+)/gi,
                /(?:resolve|resolves|resolved|resolving)\s+([A-Z]+-\d+)/gi,
                /(?:complete|completes|completed|completing)\s+([A-Z]+-\d+)/gi,
                /(?:ref|refs|references)\s+([A-Z]+-\d+)/gi,
                /(?:part of|related to|contributes to|toward|towards)\s+([A-Z]+-\d+)/gi
            ];
            
            // Pattern for magic words with markdown links (e.g., "Fixes [HOG-14](URL)")
            const markdownLinkPatterns = [
                /(?:close|closes|closed|closing)\s+\[([A-Z]+-\d+)\]/gi,
                /(?:fix|fixes|fixed|fixing)\s+\[([A-Z]+-\d+)\]/gi,
                /(?:resolve|resolves|resolved|resolving)\s+\[([A-Z]+-\d+)\]/gi,
                /(?:complete|completes|completed|completing)\s+\[([A-Z]+-\d+)\]/gi,
                /(?:ref|refs|references)\s+\[([A-Z]+-\d+)\]/gi,
                /(?:part of|related to|contributes to|toward|towards)\s+\[([A-Z]+-\d+)\]/gi
            ];
            
            // Check bare ID patterns first
            for (const pattern of bareIdPatterns) {
                const match = fullText.match(pattern);
                if (match) {
                    const issueIdMatch = match[0].match(/([A-Z]+-\d+)/);
                    if (issueIdMatch) {
                        linkedIssueId = issueIdMatch[1];
                        console.log('[Linear Detection] Found magic word with bare ID:', match[0], 'Issue ID:', linkedIssueId);
                        break;
                    }
                }
            }
            
            // If no bare ID found, check markdown link patterns
            if (!linkedIssueId) {
                for (const pattern of markdownLinkPatterns) {
                    const match = pattern.exec(fullText);
                    if (match) {
                        linkedIssueId = match[1];
                        console.log('[Linear Detection] Found magic word with markdown link:', match[0], 'Issue ID:', linkedIssueId);
                        break;
                    }
                }
            }
        }
        
        if (linkedIssueId) {
            console.log('[Linear Detection] Setting up linked issue:', linkedIssueId);
            
            // Extract team key from issue ID (e.g., SOCIAL from SOCIAL-70)
            const teamKey = linkedIssueId.split('-')[0].toLowerCase();
            const issueUrl = `https://linear.app/${teamKey}/issue/${linkedIssueId}`;
            
            const status = document.getElementById('linear-status');
            if (status) {
                status.innerHTML = `✅ Linked to Linear issue: <a href="${issueUrl}" target="_blank" style="color: #5E6AD2; font-weight: 600; text-decoration: none;">${linkedIssueId}</a>`;
            }
            
            const createButton = document.getElementById('create-linear-issue');
            if (createButton) {
                createButton.disabled = false;
                createButton.textContent = '🔗 Open Linear Issue';
                createButton.style.backgroundColor = '#5E6AD2';
                
                // Remove existing click handler and add new one
                createButton.removeEventListener('click', createLinearIssue);
                createButton.onclick = () => {
                    window.open(issueUrl, '_blank');
                };
            }
        } else {
            console.log('[Linear Detection] No linked issue found');
        }
    }

    async function createLinearIssue() {
        if (!linearConfig.apiKey) {
            showNotification('Please configure your Linear API key in settings', 'error');
            showSettings();
            return;
        }

        if (!linearConfig.defaultTeamId) {
            showNotification('Please select a team in settings', 'error');
            showSettings();
            return;
        }

        const button = document.getElementById('create-linear-issue');
        const status = document.getElementById('linear-status');
        
        button.disabled = true;
        button.textContent = '🔄 Creating...';
        status.textContent = 'Creating Linear issue...';

        try {
            // Get PR information
            const prTitle = getPRTitle();
            const prDescription = getPRDescription();
            const prUrl = window.location.href;

            if (!prTitle) {
                throw new Error('Could not get PR title');
            }

            // Create issue via Linear API
            const issueData = await createIssueViaAPI(prTitle, prDescription, prUrl);
            
            if (issueData) {
                const issueId = issueData.identifier;
                const issueUrl = issueData.url;
                
                status.innerHTML = `✅ Created Linear issue: <a href="${issueUrl}" target="_blank" style="color: #5E6AD2; font-weight: 600;">${issueId}</a>`;
                button.textContent = '✅ Issue Created';
                
                showNotification(`Successfully created Linear issue ${issueId}`, 'success');

                // Update PR title if auto-update is enabled
                if (linearConfig.autoUpdate) {
                    setTimeout(() => {
                        updatePRTitle(issueId);
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('[Linear API] Error creating issue:', error);
            
            // Provide specific error messages
            let errorMessage = error.message;
            if (errorMessage.includes('Argument Validation Error')) {
                errorMessage = 'Invalid request. Please check your team selection in settings.';
            } else if (errorMessage.includes('Unauthorized')) {
                errorMessage = 'Invalid API key. Please check your settings.';
            }
            
            showNotification('Failed: ' + errorMessage, 'error');
            button.disabled = false;
            button.textContent = '➕ Create Linear Issue';
            status.innerHTML = `<span style="color: #dc3545;">Error: ${errorMessage}</span>`;
        }
    }

    async function createIssueViaAPI(title, description, prUrl) {
        // Validate inputs
        if (!title || !linearConfig.defaultTeamId) {
            throw new Error('Missing required fields: title or team ID');
        }

        // Use only the PR description without adding GitHub PR link
        const fullDescription = description || '';

        // GraphQL mutation to create issue
        const mutation = `
            mutation CreateIssue($title: String!, $description: String!, $teamId: String!, $projectId: String) {
                issueCreate(
                    input: {
                        title: $title
                        description: $description
                        teamId: $teamId
                        projectId: $projectId
                    }
                ) {
                    success
                    issue {
                        id
                        identifier
                        title
                        url
                    }
                }
            }
        `;

        const variables = {
            title: title,
            description: fullDescription,
            teamId: linearConfig.defaultTeamId,
            projectId: linearConfig.defaultProjectId || null
        };

        console.log('[Linear API] Creating issue with:', {
            title: title.substring(0, 50) + '...',
            teamId: linearConfig.defaultTeamId,
            hasDescription: !!description,
            hasProjectId: !!linearConfig.defaultProjectId
        });

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: LINEAR_API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': linearConfig.apiKey
                },
                data: JSON.stringify({
                    query: mutation,
                    variables: variables
                }),
                onload: function(response) {
                    console.log('[Linear API] Response status:', response.status);
                    
                    try {
                        const data = JSON.parse(response.responseText);
                        console.log('[Linear API] Response data:', data);
                        
                        if (data.errors) {
                            console.error('[Linear API] GraphQL errors:', data.errors);
                            const errorMessage = data.errors.map(e => e.message).join(', ');
                            reject(new Error(errorMessage));
                        } else if (data.data && data.data.issueCreate) {
                            if (data.data.issueCreate.success) {
                                resolve(data.data.issueCreate.issue);
                            } else {
                                reject(new Error('Issue creation failed'));
                            }
                        } else {
                            reject(new Error('Unexpected response format'));
                        }
                    } catch (e) {
                        console.error('[Linear API] Parse error:', e);
                        reject(new Error('Failed to parse response: ' + e.message));
                    }
                },
                onerror: function() {
                    reject(new Error('Network error - check your internet connection'));
                }
            });
        });
    }

    function updatePRTitle(linearIssueId) {
        console.log('[PR Update] Starting PR description update for:', linearIssueId);
        
        // Skip title update and go directly to description update
        openDropdownAndEdit(linearIssueId);
    }
    
    function openDropdownAndEdit(linearIssueId) {
        console.log('[PR Update] Looking for PR description edit button...');
        
        // Find the first timeline comment (PR description) specifically
        const firstTimelineComment = document.querySelector('.timeline-comment');
        if (!firstTimelineComment) {
            console.error('[PR Update] Could not find first timeline comment');
            showManualInstructions(linearIssueId);
            return;
        }
        
        console.log('[PR Update] Found first timeline comment, looking for edit controls...');
        
        // Look for the comment header within the first comment
        const commentHeader = firstTimelineComment.querySelector('.timeline-comment-header');
        if (!commentHeader) {
            console.error('[PR Update] Could not find comment header in first comment');
            showManualInstructions(linearIssueId);
            return;
        }
        
        // Try to find a direct edit button first (sometimes visible)
        let editButton = firstTimelineComment.querySelector('.js-comment-edit-button');
        if (editButton && editButton.offsetParent !== null) {
            console.log('[PR Update] Found direct edit button, clicking...');
            editButton.click();
            setTimeout(() => findAndUpdateTextarea(linearIssueId), 300);
            return;
        }
        
        // Look for dropdown menu in the comment header
        const detailsElement = commentHeader.querySelector('details');
        if (!detailsElement) {
            console.error('[PR Update] Could not find dropdown menu in comment header');
            showManualInstructions(linearIssueId);
            return;
        }
        
        console.log('[PR Update] Opening dropdown menu...');
        detailsElement.setAttribute('open', 'true');
        
        // Wait for dropdown to render and look for edit button
        setTimeout(() => {
            // Look for edit button specifically within this dropdown
            const dropdownEditButton = detailsElement.querySelector('.js-comment-edit-button');
            if (dropdownEditButton) {
                console.log('[PR Update] Found edit button in dropdown, clicking...');
                dropdownEditButton.click();
                
                // Wait for editor to load
                setTimeout(() => findAndUpdateTextarea(linearIssueId), 300);
            } else {
                console.error('[PR Update] Edit button not found in dropdown');
                console.log('[PR Update] Dropdown content:', detailsElement.innerHTML);
                showManualInstructions(linearIssueId);
            }
        }, 300);
    }
    
    function showManualInstructions(linearIssueId) {
        console.error('[PR Update] Could not update PR description automatically, showing manual instructions');
        
        const manualInstructions = `
            <div style="margin-top: 10px; padding: 10px; background: #f6f8fa; border-radius: 6px; font-size: 12px;">
                <strong>Manual Update Required:</strong><br>
                1. Click the edit button (pencil icon) next to the PR description<br>
                2. Add "<code>Fixes ${linearIssueId}</code>" at the beginning of the description<br>
                3. Click "Update comment" to save the changes
            </div>
        `;
        
        const status = document.getElementById('linear-status');
        if (status) {
            status.innerHTML = manualInstructions;
        }
        
        showNotification('Please update PR description manually. Instructions added below.', 'error');
    }
    
    function findAndUpdateTextarea(linearIssueId) {
        let attempts = 0;
        const maxAttempts = 15;
        
        const findTextarea = () => {
            attempts++;
            console.log(`[PR Update] Looking for textarea, attempt ${attempts}`);
            
            // Comprehensive textarea search
            const textareaSelectors = [
                '.comment-form-textarea',
                'textarea[name="issue[body]"]',
                'textarea[name="pull_request[body]"]',
                'textarea[aria-label*="description" i]',
                'textarea[aria-label*="comment" i]',
                'textarea.form-control',
                '#pull_request_body',
                'textarea[data-testid*="description"]',
                'textarea[placeholder*="description" i]',
                'textarea[id*="body"]',
                'textarea.js-comment-field'
            ];
            
            let textarea = null;
            for (const selector of textareaSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                    if (el && el.offsetParent !== null && !el.disabled) {
                        textarea = el;
                        console.log('[PR Update] Found textarea with selector:', selector);
                        break;
                    }
                }
                if (textarea) break;
            }
            
            // Fallback: find any visible textarea
            if (!textarea) {
                const allTextareas = document.querySelectorAll('textarea');
                for (const ta of allTextareas) {
                    if (ta.offsetParent !== null && !ta.disabled && ta.value.length > 0) {
                        textarea = ta;
                        console.log('[PR Update] Found textarea by fallback search');
                        break;
                    }
                }
            }

            if (textarea) {
                updateTextarea(textarea, linearIssueId);
            } else if (attempts < maxAttempts) {
                setTimeout(findTextarea, 400);
            } else {
                console.error('[PR Update] Could not find textarea after', maxAttempts, 'attempts');
                console.log('[PR Update] Available textareas:', document.querySelectorAll('textarea'));
                showNotification('Could not find description editor. Please update manually.', 'error');
            }
        };

        findTextarea();
    }

    function updateTextarea(textarea, linearIssueId) {
        console.log('[PR Update] Updating textarea with Linear ID:', linearIssueId);
        
        // Get current description
        let currentDescription = textarea.value;
        console.log('[PR Update] Current description length:', currentDescription.length);
        
        const magicWord = `Fixes ${linearIssueId}`;

        // Check if Linear ID already exists
        const linearPattern = /(?:Fixes|Closes|Resolves)\s+[A-Z]+-\d+/;
        if (linearPattern.test(currentDescription)) {
            // Replace existing
            currentDescription = currentDescription.replace(linearPattern, magicWord);
            console.log('[PR Update] Replaced existing Linear reference');
        } else {
            // Add new at the beginning
            currentDescription = `${magicWord}\n\n${currentDescription}`;
            console.log('[PR Update] Added new Linear reference at beginning');
        }

        // Update textarea
        textarea.value = currentDescription;
        textarea.focus();

        // Trigger multiple change events to ensure React detects the change
        const events = ['input', 'change', 'keyup', 'paste'];
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            textarea.dispatchEvent(event);
        });

        console.log('[PR Update] Triggered change events');

        // Find and click update button
        setTimeout(() => {
            const updateSelectors = [
                // Target the specific Update comment button
                'button.Button--primary[type="submit"]',
                'button[type="submit"].Button--primary',
                '.js-comment-update',
                'button[type="submit"]',
                'button[value="Save changes"]',
                'button:contains("Update comment")',
                '.btn-primary[type="submit"]',
                // More specific selectors for the new GitHub UI
                'button.Button--primary.Button--medium[type="submit"]',
                'button[data-view-component="true"][type="submit"]'
            ];
            
            let updateButton = null;
            for (const selector of updateSelectors) {
                updateButton = document.querySelector(selector);
                if (updateButton && updateButton.offsetParent !== null) {
                    console.log('[PR Update] Found update button with selector:', selector);
                    break;
                }
            }

            if (updateButton) {
                updateButton.click();
                console.log('[PR Update] Clicked update button');
                showNotification(`✅ PR linked to Linear issue ${linearIssueId}`, 'success');
                
                // Update the status in our UI
                setTimeout(() => {
                    checkExistingLink();
                }, 1000);
            } else {
                console.error('[PR Update] Could not find update button');
                showNotification('Please save the changes manually', 'error');
            }
        }, 500);
    }

    async function showSettings() {
        // Load teams if not already loaded
        if (linearConfig.apiKey && teams.length === 0) {
            await loadTeams();
        }

        const modal = document.createElement('div');
        modal.className = 'linear-settings';
        modal.innerHTML = `
            <h3>Linear API Settings</h3>
            
            <div class="field-group">
                <label for="linear-api-key">Linear API Key</label>
                <input type="password" id="linear-api-key" placeholder="lin_api_..." value="${linearConfig.apiKey || ''}">
                <div class="api-key-help">
                    <strong>How to get your Linear API key:</strong>
                    <div class="api-key-steps">
                        <ol>
                            <li>Go to <strong>Linear.app</strong> and log in</li>
                            <li>Click your avatar → <strong>Settings</strong></li>
                            <li>In the left sidebar, click <strong>Security & access</strong></li>
                            <li>Scroll down to <strong>Personal API keys</strong> section</li>
                            <li>Click <strong>New API key</strong></li>
                            <li>Give it a name like <code>GitHub Integration</code></li>
                            <li>Copy the key (starts with <code>lin_api_</code>)</li>
                            <li>Paste it in the field above</li>
                        </ol>
                        <strong>Note:</strong> The API key will only be shown once, so copy it immediately!
                    </div>
                </div>
            </div>
            
            <div class="field-group">
                <label for="linear-team-select">Default Team</label>
                <select id="linear-team-select">
                    <option value="">Select a team...</option>
                    ${teams.map(team => `
                        <option value="${team.id}" ${team.id === linearConfig.defaultTeamId ? 'selected' : ''}>
                            ${team.name} (${team.key})
                        </option>
                    `).join('')}
                </select>
                <div class="help-text">Choose which Linear team to create issues in. If you don't see your team, check your API key.</div>
            </div>
            
            <div class="field-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="linear-auto-update" ${linearConfig.autoUpdate ? 'checked' : ''}>
                    <label for="linear-auto-update">Automatically update PR description after creating issue</label>
                </div>
                <div class="help-text">When enabled, the PR description will be automatically updated with the Linear issue ID (e.g., "Fixes ABC-123" at the top)</div>
            </div>
            
            <div class="field-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="linear-first-section-only" ${linearConfig.firstSectionOnly ? 'checked' : ''}>
                    <label for="linear-first-section-only">Include only first heading and content below it</label>
                </div>
                <div class="help-text">When enabled, only the first heading and content until the next heading will be sent to Linear (the full PR description is still searched for existing Linear issues)</div>
            </div>
            
            <div class="linear-settings-buttons">
                <button class="linear-api-button" style="background-color: #30363d; color: #c9d1d9;" id="cancel-settings">Cancel</button>
                <button class="linear-api-button" id="save-settings">Save Settings</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            backdrop-filter: blur(2px);
        `;
        document.body.appendChild(backdrop);

        // Event listeners
        document.getElementById('save-settings').addEventListener('click', async () => {
            const apiKey = document.getElementById('linear-api-key').value;
            const teamId = document.getElementById('linear-team-select').value;
            const autoUpdate = document.getElementById('linear-auto-update').checked;
            const firstSectionOnly = document.getElementById('linear-first-section-only').checked;

            linearConfig.apiKey = apiKey;
            linearConfig.defaultTeamId = teamId;
            linearConfig.autoUpdate = autoUpdate;
            linearConfig.firstSectionOnly = firstSectionOnly;

            saveConfig();

            if (apiKey && !teamId) {
                await loadTeams();
            }

            modal.remove();
            backdrop.remove();
            showNotification('Settings saved', 'success');
        });

        document.getElementById('cancel-settings').addEventListener('click', () => {
            modal.remove();
            backdrop.remove();
        });

        // Load teams when API key changes
        document.getElementById('linear-api-key').addEventListener('blur', async (e) => {
            const newKey = e.target.value;
            if (newKey && newKey !== linearConfig.apiKey) {
                linearConfig.apiKey = newKey;
                await loadTeams();
                // Update team dropdown
                const teamSelect = document.getElementById('linear-team-select');
                teamSelect.innerHTML = `
                    <option value="">Select a team...</option>
                    ${teams.map(team => `
                        <option value="${team.id}">${team.name}</option>
                    `).join('')}
                `;
            }
        });
    }

    async function loadTeams() {
        if (!linearConfig.apiKey) return;

        // Query for all teams including parent/child relationships
        const query = `
            query Teams {
                teams(first: 100) {
                    nodes {
                        id
                        name
                        key
                        private
                        organization {
                            id
                            name
                        }
                    }
                }
                viewer {
                    id
                    teams {
                        nodes {
                            id
                            name
                            key
                            private
                        }
                    }
                }
            }
        `;

        try {
            const response = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: LINEAR_API_URL,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': linearConfig.apiKey
                    },
                    data: JSON.stringify({ query }),
                    onload: resolve,
                    onerror: reject
                });
            });

            if (response.status === 200) {
                const data = JSON.parse(response.responseText);
                console.log('[Linear API] Teams response:', data);
                
                if (data.data) {
                    // Get teams the user has access to
                    if (data.data.viewer && data.data.viewer.teams) {
                        teams = data.data.viewer.teams.nodes;
                        console.log('[Linear API] User teams loaded:', teams.length);
                    } else if (data.data.teams) {
                        teams = data.data.teams.nodes;
                        console.log('[Linear API] All teams loaded:', teams.length);
                    }
                    
                    // Sort teams alphabetically
                    teams.sort((a, b) => a.name.localeCompare(b.name));
                }
            }
        } catch (err) {
            console.error('[Linear API] Error loading teams:', err);
            showNotification('Failed to load teams. Check your API key.', 'error');
        }
    }

    function getPRTitle() {
        const titleElement = document.querySelector('.js-issue-title');
        return titleElement ? titleElement.textContent.trim() : '';
    }

    function getPRDescription() {
        const firstComment = document.querySelector('.comment-body');
        if (!firstComment) return '';

        const clone = firstComment.cloneNode(true);
        
        // Remove the Linear integration section and everything after it
        const linearSection = clone.querySelector('.linear-api-integration');
        if (linearSection) {
            // Remove the Linear section itself
            linearSection.remove();
        }
        
        // Also remove any previous Linear integration sections
        const oldLinearSections = clone.querySelectorAll('#linear-github-integration, .linear-github-integration');
        oldLinearSections.forEach(section => section.remove());

        let markdown = htmlToMarkdown(clone);
        
        // If "first section only" is enabled, extract only the first heading and content below it
        if (linearConfig && linearConfig.firstSectionOnly) {
            markdown = extractFirstSection(markdown);
        }

        return markdown;
    }
    
    function extractFirstSection(markdown) {
        if (!markdown) return '';
        
        const lines = markdown.split('\n');
        const result = [];
        let foundFirstHeading = false;
        let headingLevel = 0;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Check if this line is a heading
            const headingMatch = trimmedLine.match(/^(#{1,6})\s+/);
            
            if (headingMatch) {
                const currentLevel = headingMatch[1].length;
                
                if (!foundFirstHeading) {
                    // This is the first heading we found
                    foundFirstHeading = true;
                    headingLevel = currentLevel;
                    result.push(line);
                } else if (currentLevel <= headingLevel) {
                    // Found another heading at the same or higher level, stop here
                    break;
                } else {
                    // This is a sub-heading, include it
                    result.push(line);
                }
            } else if (foundFirstHeading) {
                // We've found the first heading, include all content until the next same-level heading
                result.push(line);
            }
            // If we haven't found a heading yet, skip this line
        }
        
        return result.join('\n').trim();
    }

    function htmlToMarkdown(element) {
        let markdown = '';
        
        function processNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent;
            }
            
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return '';
            }
            
            const tagName = node.tagName.toLowerCase();
            let content = '';
            
            for (const child of node.childNodes) {
                content += processNode(child);
            }
            
            switch (tagName) {
                case 'h1': return `# ${content.trim()}\n\n`;
                case 'h2': return `## ${content.trim()}\n\n`;
                case 'h3': return `### ${content.trim()}\n\n`;
                case 'h4': return `#### ${content.trim()}\n\n`;
                case 'h5': return `##### ${content.trim()}\n\n`;
                case 'h6': return `###### ${content.trim()}\n\n`;
                case 'p': return `${content.trim()}\n\n`;
                case 'br': return '\n';
                case 'strong':
                case 'b': return `**${content}**`;
                case 'em':
                case 'i': return `*${content}*`;
                case 'code': return `\`${content}\``;
                case 'pre': {
                    const codeBlock = node.querySelector('code');
                    if (codeBlock) {
                        const lang = codeBlock.className.match(/language-(\w+)/)?.[1] || '';
                        return `\`\`\`${lang}\n${codeBlock.textContent.trim()}\n\`\`\`\n\n`;
                    }
                    return `\`\`\`\n${content.trim()}\n\`\`\`\n\n`;
                }
                case 'a': {
                    const href = node.getAttribute('href');
                    return href ? `[${content}](${href})` : content;
                }
                case 'img': {
                    const src = node.getAttribute('src');
                    const alt = node.getAttribute('alt') || '';
                    return src ? `![${alt}](${src})` : '';
                }
                case 'ul':
                case 'ol': return `${content}\n`;
                case 'li': {
                    const parent = node.parentElement;
                    if (parent && parent.tagName.toLowerCase() === 'ol') {
                        const index = Array.from(parent.children).indexOf(node) + 1;
                        return `${index}. ${content.trim()}\n`;
                    }
                    return `- ${content.trim()}\n`;
                }
                case 'blockquote': return content.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
                case 'hr': return '---\n\n';
                case 'del': return `~~${content}~~`;
                case 'div': {
                    // Only skip divs that are NOT the root comment-body container
                    if (node.classList.contains('comment-body') || node.classList.contains('markdown-body')) {
                        return content; // Keep the main container
                    }
                    return ''; // Skip other divs
                }
                default: return content;
            }
        }
        
        markdown = processNode(element);
        markdown = markdown.replace(/\n{3,}/g, '\n\n');
        
        return markdown.trim();
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `linear-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
})();