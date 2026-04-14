window.addEventListener('DOMContentLoaded', function() {
    (function() {
        const topAuthBtn = document.getElementById('top-auth-btn');
        const topSignoutBtn = document.getElementById('top-signout-btn');
        const brandEl = document.querySelector('.topbar .brand');
        const brandNameEl = brandEl ? brandEl.querySelector('span[data-setting-key="brand_name"], span:last-child') : null;
        if (!topAuthBtn || !topSignoutBtn) return;

        const config = window.PV_SUPABASE || {};
        const hasSupabaseConfig = !!(config.url && config.anonKey && window.supabase && window.supabase.createClient);
        if (!hasSupabaseConfig) {
            topAuthBtn.style.display = 'none';
            topSignoutBtn.style.display = 'none';
            return;
        }

        const authMarkup = [
            '<div id="global-auth-modal" class="auth-modal" aria-hidden="true" hidden inert>',
            '  <div class="auth-card global-auth-card">',
            '    <div class="auth-head">',
            '      <h3>Pantheverse Login</h3>',
            '      <p>Sign in, create an account, or reset your password.</p>',
            '    </div>',
            '    <div class="auth-body">',
            '      <div class="auth-mode-tabs">',
            '        <button id="global-auth-mode-signin" class="auth-mode-btn active" type="button">Login</button>',
            '        <button id="global-auth-mode-register" class="auth-mode-btn" type="button">Create account</button>',
            '      </div>',
            '      <div class="auth-field-group">',
            '        <label for="global-auth-email">Email address</label>',
            '        <input id="global-auth-email" class="edit-input" type="email" placeholder="you@example.com" autocomplete="email">',
            '      </div>',
            '      <div id="global-auth-password-wrap" class="auth-field-group">',
            '        <label for="global-auth-password">Password</label>',
            '        <input id="global-auth-password" class="edit-input" type="password" placeholder="Password" autocomplete="current-password">',
            '      </div>',
            '      <div id="global-auth-confirm-wrap" class="auth-field-group" style="display:none;">',
            '        <label for="global-auth-confirm-password">Confirm password</label>',
            '        <input id="global-auth-confirm-password" class="edit-input" type="password" placeholder="Confirm password" autocomplete="new-password">',
            '      </div>',
            '      <div id="global-auth-helper-row" class="auth-helper-row">',
            '        <button id="global-auth-forgot-btn" class="auth-link-btn" type="button">Forgot password?</button>',
            '        <button id="global-auth-back-btn" class="auth-link-btn" type="button" style="display:none;">Back to login</button>',
            '      </div>',
            '      <div class="auth-card-actions">',
            '        <button id="global-auth-login-btn" class="edit-btn" type="button">Login now</button>',
            '        <button id="global-auth-register-btn" class="edit-btn" type="button">Create account</button>',
            '        <button id="global-auth-reset-btn" class="edit-btn" type="button" style="display:none;">Update password</button>',
            '        <button id="global-auth-cancel-btn" class="btn btn-ghost" type="button">Cancel</button>',
            '      </div>',
            '    </div>',
            '    <p id="global-auth-message" class="auth-message"></p>',
            '  </div>',
            '</div>'
        ].join('');
        document.body.insertAdjacentHTML('beforeend', authMarkup);

        const accountMenuMarkup = [
            '<div id="brand-account-menu" class="brand-account-menu" hidden>',
            '  <div id="brand-account-label" class="brand-account-label"></div>',
            '  <button id="brand-account-settings" class="brand-account-item" type="button">Settings</button>',
            '  <button id="brand-account-signout" class="brand-account-item danger" type="button">Sign out</button>',
            '</div>'
        ].join('');
        const accountModalMarkup = [
            '<div id="account-settings-modal" class="account-settings-modal" aria-hidden="true" hidden inert>',
            '  <div class="account-settings-card">',
            '    <div class="account-settings-head">',
            '      <div class="account-settings-title-wrap">',
            '        <p class="account-settings-eyebrow">Site settings</p>',
            '        <h3>Pantheverse Settings</h3>',
            '        <p>Adjust look, performance, and editor safety from one place.</p>',
            '      </div>',
            '      <button id="account-settings-close-x" class="account-settings-close" type="button" aria-label="Close settings">Close</button>',
            '    </div>',
            '    <div class="account-settings-layout">',
            '      <section class="account-settings-panel">',
            '        <h4>Visual style</h4>',
            '        <div class="account-setting-row">',
            '          <label for="pref-theme-mode">Theme mode</label>',
            '          <select id="pref-theme-mode" class="edit-input">',
            '            <option value="bright">Bright</option>',
            '            <option value="dark">Dark</option>',
            '            <option value="auto">Auto (system)</option>',
            '          </select>',
            '        </div>',
            '        <label class="account-toggle">',
            '          <input id="pref-compact-topbar" type="checkbox">',
            '          <span><strong>Compact top bar</strong><small>Keep navigation tighter on every page.</small></span>',
            '        </label>',
            '      </section>',
            '      <section class="account-settings-panel">',
            '        <h4>Performance</h4>',
            '        <label class="account-toggle">',
            '          <input id="pref-lite-mode" type="checkbox">',
            '          <span><strong>Lite mode</strong><small>Lower motion and rendering cost for slower devices.</small></span>',
            '        </label>',
            '        <label class="account-toggle">',
            '          <input id="pref-min-effects" type="checkbox">',
            '          <span><strong>Minimal effects</strong><small>Reduce glow and blur layers.</small></span>',
            '        </label>',
            '        <label class="account-toggle">',
            '          <input id="pref-smooth-transitions" type="checkbox">',
            '          <span><strong>Smooth page transitions</strong><small>Keep route changes visually connected.</small></span>',
            '        </label>',
            '      </section>',
            '      <section class="account-settings-panel account-settings-panel-links">',
            '        <h4>Quick links</h4>',
            '        <ul class="account-settings-link-list">',
            '          <li><button id="account-settings-open-home" class="account-settings-link-btn" type="button">Home</button></li>',
            '          <li><button id="account-settings-open-rules" class="account-settings-link-btn" type="button">Rules</button></li>',
            '          <li><button id="account-settings-open-about" class="account-settings-link-btn" type="button">About</button></li>',
            '        </ul>',
            '      </section>',
            '    </div>',
            '    <div class="account-settings-footer">',
            '      <p id="account-settings-msg" class="account-settings-msg"></p>',
            '      <div class="account-settings-actions">',
            '        <button id="account-settings-save" class="edit-btn" type="button">Save settings</button>',
            '        <button id="account-settings-cancel" class="btn btn-ghost" type="button">Close</button>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('');
        if (brandEl) {
            brandEl.insertAdjacentHTML('beforeend', accountMenuMarkup);
        } else {
            document.body.insertAdjacentHTML('beforeend', accountMenuMarkup);
        }
        document.body.insertAdjacentHTML('beforeend', accountModalMarkup);

        const modal = document.getElementById('global-auth-modal');
        const modeSigninBtn = document.getElementById('global-auth-mode-signin');
        const modeRegisterBtn = document.getElementById('global-auth-mode-register');
        const emailInput = document.getElementById('global-auth-email');
        const passwordWrap = document.getElementById('global-auth-password-wrap');
        const passwordInput = document.getElementById('global-auth-password');
        const confirmWrap = document.getElementById('global-auth-confirm-wrap');
        const confirmInput = document.getElementById('global-auth-confirm-password');
        const helperRow = document.getElementById('global-auth-helper-row');
        const forgotBtn = document.getElementById('global-auth-forgot-btn');
        const backToLoginBtn = document.getElementById('global-auth-back-btn');
        const loginBtn = document.getElementById('global-auth-login-btn');
        const registerBtn = document.getElementById('global-auth-register-btn');
        const resetBtn = document.getElementById('global-auth-reset-btn');
        const cancelBtn = document.getElementById('global-auth-cancel-btn');
        const messageEl = document.getElementById('global-auth-message');
        const brandAccountMenu = document.getElementById('brand-account-menu');
        const brandAccountLabel = document.getElementById('brand-account-label');
        const brandAccountSettingsBtn = document.getElementById('brand-account-settings');
        const brandAccountSignoutBtn = document.getElementById('brand-account-signout');
        const accountSettingsModal = document.getElementById('account-settings-modal');
        const accountSettingsCloseXBtn = document.getElementById('account-settings-close-x');
        const prefThemeModeSelect = document.getElementById('pref-theme-mode');
        const prefCompactTopbarInput = document.getElementById('pref-compact-topbar');
        const prefLiteModeInput = document.getElementById('pref-lite-mode');
        const prefMinEffectsInput = document.getElementById('pref-min-effects');
        const prefSmoothTransitionsInput = document.getElementById('pref-smooth-transitions');
        const prefConfirmActionsInput = document.getElementById('pref-confirm-actions');
        const prefEditorFocusInput = document.getElementById('pref-editor-focus');
        const accountSettingsOpenHomeBtn = document.getElementById('account-settings-open-home');
        const accountSettingsOpenRulesBtn = document.getElementById('account-settings-open-rules');
        const accountSettingsOpenAboutBtn = document.getElementById('account-settings-open-about');
        const accountSettingsMsg = document.getElementById('account-settings-msg');
        const accountSettingsSaveBtn = document.getElementById('account-settings-save');
        const accountSettingsCancelBtn = document.getElementById('account-settings-cancel');

        const state = {
            client: window.supabase.createClient(config.url, config.anonKey),
            mode: 'signin',
            session: null,
            defaultBrandName: brandNameEl ? (brandNameEl.textContent || '').trim() : 'Pantheverse',
            userSettings: null
        };

        const AUTO_LOW_END_MODE = document.documentElement.classList.contains('low-end-mode');
        const SETTINGS_KEY = 'pv_site_settings_v3';
        const LITE_STORAGE_KEY = 'pv_lite_mode';
        const DEFAULT_SETTINGS = {
            themeMode: 'bright',
            compactTopbar: false,
            liteMode: false,
            minEffects: false,
            smoothTransitions: true,
            confirmActions: true,
            emphasizeEditorTools: true
        };

        function setMessage(message, isError) {
            messageEl.textContent = message || '';
            messageEl.className = isError ? 'auth-message error' : 'auth-message';
        }

        function formatAuthError(error, fallbackMessage) {
            const raw = error && error.message ? String(error.message) : '';
            const code = error && error.code ? String(error.code).toLowerCase() : '';
            const status = Number(error && (error.status || error.statusCode) ? (error.status || error.statusCode) : 0);
            const lower = raw.toLowerCase();
            if (
                lower.includes('email rate limit exceeded') ||
                code.includes('over_email_send_rate_limit') ||
                (status === 429 && (lower.includes('email') || lower.includes('rate')))
            ) {
                return 'Email limit reached. Supabase default mailer is very low (about 2 emails/hour). Wait and retry, or configure custom SMTP.';
            }
            if (lower.includes('error sending recovery email')) {
                return 'Recovery email could not be sent. Check Supabase Auth Logs and SMTP settings (sender address/domain, host, port, username, password).';
            }
            if (lower.includes('rate limit')) {
                return 'Too many requests right now. Please wait and try again.';
            }
            if (raw) {
                const details = [];
                if (code) details.push('code: ' + code);
                if (status) details.push('status: ' + status);
                return details.length ? raw + ' (' + details.join(', ') + ')' : raw;
            }
            return fallbackMessage;
        }

        function setAccountSettingsMessage(message, isError) {
            if (!accountSettingsMsg) return;
            accountSettingsMsg.textContent = message || '';
            accountSettingsMsg.className = isError ? 'account-settings-msg error' : 'account-settings-msg';
        }

        function normalizeSettings(raw) {
            const candidate = raw || {};
            return {
                themeMode: ['bright', 'dark', 'auto'].includes(candidate.themeMode) ? candidate.themeMode : DEFAULT_SETTINGS.themeMode,
                compactTopbar: typeof candidate.compactTopbar === 'boolean' ? candidate.compactTopbar : DEFAULT_SETTINGS.compactTopbar,
                liteMode: typeof candidate.liteMode === 'boolean' ? candidate.liteMode : DEFAULT_SETTINGS.liteMode,
                minEffects: typeof candidate.minEffects === 'boolean' ? candidate.minEffects : DEFAULT_SETTINGS.minEffects,
                smoothTransitions: typeof candidate.smoothTransitions === 'boolean' ? candidate.smoothTransitions : DEFAULT_SETTINGS.smoothTransitions,
                confirmActions: typeof candidate.confirmActions === 'boolean' ? candidate.confirmActions : DEFAULT_SETTINGS.confirmActions,
                emphasizeEditorTools: typeof candidate.emphasizeEditorTools === 'boolean' ? candidate.emphasizeEditorTools : DEFAULT_SETTINGS.emphasizeEditorTools
            };
        }

        function loadSettings() {
            try {
                const raw = localStorage.getItem(SETTINGS_KEY);
                if (!raw) return normalizeSettings(DEFAULT_SETTINGS);
                return normalizeSettings(JSON.parse(raw));
            } catch (_error) {
                return normalizeSettings(DEFAULT_SETTINGS);
            }
        }

        function persistSettings(settings) {
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
            } catch (_error) {
                // Ignore storage errors and keep runtime state only.
            }
        }

        function detectSystemTheme() {
            try {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
            } catch (_error) {
                // Fallback to bright.
            }
            return 'bright';
        }

        function applyThemeMode(mode) {
            const resolved = mode === 'auto' ? detectSystemTheme() : mode;
            document.documentElement.setAttribute('data-theme', resolved);
        }

        function applyLiteMode(enabled) {
            const forcedLite = !!enabled;
            const effectiveLite = AUTO_LOW_END_MODE || forcedLite;

            if (forcedLite) {
                try {
                    localStorage.setItem(LITE_STORAGE_KEY, '1');
                } catch (_error) {
                    // Ignore storage failures.
                }
            } else {
                try {
                    localStorage.removeItem(LITE_STORAGE_KEY);
                } catch (_error) {
                    // Ignore storage failures.
                }
            }

            document.documentElement.classList.toggle('low-end-mode', effectiveLite);
            document.body.classList.toggle('low-end-mode', effectiveLite);
        }

        function applyUserSettings(settings) {
            state.userSettings = normalizeSettings(settings);
            applyThemeMode(state.userSettings.themeMode);
            applyLiteMode(state.userSettings.liteMode);
            document.body.classList.toggle('pref-compact-topbar', !!state.userSettings.compactTopbar);
            document.body.classList.toggle('pref-min-effects', !!state.userSettings.minEffects);
            document.body.classList.toggle('pref-no-transitions', !state.userSettings.smoothTransitions);
            document.body.classList.toggle('pref-editor-focus', !!state.userSettings.emphasizeEditorTools);
        }

        function setSettingsForm(settings) {
            const normalized = normalizeSettings(settings);
            if (prefThemeModeSelect) prefThemeModeSelect.value = normalized.themeMode;
            if (prefCompactTopbarInput) prefCompactTopbarInput.checked = normalized.compactTopbar;
            if (prefLiteModeInput) {
                prefLiteModeInput.checked = normalized.liteMode || AUTO_LOW_END_MODE;
                prefLiteModeInput.disabled = AUTO_LOW_END_MODE;
            }
            if (prefMinEffectsInput) prefMinEffectsInput.checked = normalized.minEffects;
            if (prefSmoothTransitionsInput) prefSmoothTransitionsInput.checked = normalized.smoothTransitions;
            if (prefConfirmActionsInput) prefConfirmActionsInput.checked = normalized.confirmActions;
            if (prefEditorFocusInput) prefEditorFocusInput.checked = normalized.emphasizeEditorTools;
        }

        function readSettingsForm() {
            return normalizeSettings({
                themeMode: prefThemeModeSelect ? prefThemeModeSelect.value : DEFAULT_SETTINGS.themeMode,
                compactTopbar: prefCompactTopbarInput ? !!prefCompactTopbarInput.checked : DEFAULT_SETTINGS.compactTopbar,
                liteMode: prefLiteModeInput ? (!AUTO_LOW_END_MODE && !!prefLiteModeInput.checked) : DEFAULT_SETTINGS.liteMode,
                minEffects: prefMinEffectsInput ? !!prefMinEffectsInput.checked : DEFAULT_SETTINGS.minEffects,
                smoothTransitions: prefSmoothTransitionsInput ? !!prefSmoothTransitionsInput.checked : DEFAULT_SETTINGS.smoothTransitions,
                confirmActions: prefConfirmActionsInput ? !!prefConfirmActionsInput.checked : ((state.userSettings && typeof state.userSettings.confirmActions === 'boolean') ? state.userSettings.confirmActions : DEFAULT_SETTINGS.confirmActions),
                emphasizeEditorTools: prefEditorFocusInput ? !!prefEditorFocusInput.checked : ((state.userSettings && typeof state.userSettings.emphasizeEditorTools === 'boolean') ? state.userSettings.emphasizeEditorTools : DEFAULT_SETTINGS.emphasizeEditorTools)
            });
        }

        function getDisplayName(user) {
            if (!user) return state.defaultBrandName;
            const meta = user.user_metadata || {};
            const fromMeta = meta.username || meta.display_name || meta.full_name || meta.name;
            if (fromMeta && String(fromMeta).trim()) return String(fromMeta).trim();
            const email = user.email || '';
            if (email.includes('@')) return email.split('@')[0];
            return state.defaultBrandName;
        }

        function closeBrandMenu() {
            if (!brandAccountMenu) return;
            brandAccountMenu.hidden = true;
            brandAccountMenu.classList.remove('open');
        }

        function showDialog(dialog) {
            if (!dialog) return;
            dialog.hidden = false;
            dialog.removeAttribute('inert');
            dialog.setAttribute('aria-hidden', 'false');
        }

        function hideDialog(dialog) {
            if (!dialog) return;
            const active = document.activeElement;
            if (active && dialog.contains(active) && typeof active.blur === 'function') {
                active.blur();
            }
            dialog.classList.remove('open');
            dialog.setAttribute('aria-hidden', 'true');
            dialog.setAttribute('inert', '');
            dialog.hidden = true;
        }

        function openBrandMenu() {
            if (!brandAccountMenu || !state.session) return;
            brandAccountMenu.hidden = false;
            brandAccountMenu.classList.add('open');
        }

        function toggleBrandMenu() {
            if (!brandAccountMenu || !state.session) return;
            if (brandAccountMenu.hidden) {
                openBrandMenu();
                return;
            }
            closeBrandMenu();
        }

        function openAccountSettingsModal() {
            if (!accountSettingsModal || !state.session) return;
            showDialog(accountSettingsModal);
            accountSettingsModal.classList.add('open');
            setSettingsForm(state.userSettings || DEFAULT_SETTINGS);
            setAccountSettingsMessage('', false);
            if (prefThemeModeSelect) prefThemeModeSelect.focus();
        }

        function closeAccountSettingsModal() {
            if (!accountSettingsModal) return;
            hideDialog(accountSettingsModal);
            setAccountSettingsMessage('', false);
        }

        function syncBrandAccount(session) {
            if (!brandEl || !brandNameEl) return;
            if (!session) {
                brandNameEl.textContent = state.defaultBrandName;
                brandEl.classList.add('brand-account-enabled');
                brandEl.setAttribute('role', 'button');
                brandEl.setAttribute('tabindex', '0');
                closeBrandMenu();
                closeAccountSettingsModal();
                return;
            }
            const displayName = getDisplayName(session.user);
            brandNameEl.textContent = displayName;
            brandEl.classList.add('brand-account-enabled');
            brandEl.setAttribute('role', 'button');
            brandEl.setAttribute('tabindex', '0');
            if (brandAccountLabel) brandAccountLabel.textContent = displayName;
        }

        function setMode(mode) {
            state.mode = mode;
            const isSignin = mode === 'signin';
            const isRegister = mode === 'register';
            const isReset = mode === 'reset';

            modeSigninBtn.classList.toggle('active', isSignin);
            modeRegisterBtn.classList.toggle('active', isRegister);

            passwordWrap.style.display = 'block';
            confirmWrap.style.display = (isRegister || isReset) ? 'block' : 'none';
            helperRow.style.display = 'flex';
            forgotBtn.style.display = isSignin ? 'inline-flex' : 'none';
            backToLoginBtn.style.display = isReset ? 'inline-flex' : 'none';

            loginBtn.style.display = isSignin ? 'inline-flex' : 'none';
            registerBtn.style.display = isRegister ? 'inline-flex' : 'none';
            resetBtn.style.display = isReset ? 'inline-flex' : 'none';
            setMessage('', false);
        }

        function setBusy(isBusy) {
            modeSigninBtn.disabled = isBusy;
            modeRegisterBtn.disabled = isBusy;
            emailInput.disabled = isBusy;
            passwordInput.disabled = isBusy;
            confirmInput.disabled = isBusy;
            loginBtn.disabled = isBusy;
            registerBtn.disabled = isBusy;
            resetBtn.disabled = isBusy;
            forgotBtn.disabled = isBusy;
            backToLoginBtn.disabled = isBusy;
            cancelBtn.disabled = isBusy;
        }

        function openModal(initialMode) {
            closeBrandMenu();
            showDialog(modal);
            modal.classList.add('open');
            setMode(initialMode || 'signin');
            setBusy(false);
            setMessage('', false);
            if (state.mode === 'reset') {
                setMessage('Set a new password for your account.', false);
                passwordInput.focus();
            } else {
                emailInput.focus();
            }
        }

        function closeModal() {
            hideDialog(modal);
            setBusy(false);
            passwordInput.value = '';
            confirmInput.value = '';
            setMessage('', false);
            if (topAuthBtn && topAuthBtn.offsetParent !== null) {
                topAuthBtn.focus({ preventScroll: true });
            } else if (brandEl) {
                brandEl.focus({ preventScroll: true });
            }
        }

        function sessionRedirectUrl(forReset) {
            function toHttpUrl(value) {
                if (!value) return null;
                try {
                    const url = new URL(value, window.location.origin);
                    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                        return null;
                    }
                    url.hash = '';
                    return url;
                } catch (_error) {
                    return null;
                }
            }

            let url = toHttpUrl(window.location.href) || toHttpUrl(config.authRedirectTo) || toHttpUrl('http://localhost:3000/rules/');
            if (!url) {
                return config.authRedirectTo || 'http://localhost:3000/rules/';
            }
            if (forReset) {
                url.searchParams.set('auth_flow', 'reset');
            } else {
                url.searchParams.delete('auth_flow');
            }
            return url.toString();
        }

        function isRecoveryFlow() {
            try {
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                const queryParams = new URLSearchParams(window.location.search);
                return hashParams.get('type') === 'recovery' || queryParams.get('auth_flow') === 'reset';
            } catch (_error) {
                return false;
            }
        }

        function clearRecoveryFlowMarkers() {
            try {
                const url = new URL(window.location.href);
                url.searchParams.delete('auth_flow');
                url.hash = '';
                window.history.replaceState({}, document.title, url.pathname + url.search);
            } catch (_error) {
                // Ignore URL cleanup failures.
            }
        }

        async function hydrateRecoverySessionFromHash() {
            try {
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                if (hashParams.get('type') !== 'recovery') return;
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                if (!accessToken || !refreshToken) return;
                await state.client.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
            } catch (_error) {
                // Ignore hash hydration failures; fallback checks still run.
            }
        }

        function syncTopbar(session) {
            state.session = session || null;
            syncBrandAccount(state.session);
            if (state.session) {
                topAuthBtn.style.display = 'none';
                topSignoutBtn.style.display = 'none';
                return;
            }
            topAuthBtn.style.display = 'inline-flex';
            topSignoutBtn.style.display = 'none';
        }

        function validateAuthFields(requireConfirm) {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmInput.value;

            if (!email || !password) {
                setMessage('Email and password are required.', true);
                return null;
            }
            if (password.length < 6) {
                setMessage('Use at least 6 characters for password.', true);
                return null;
            }
            if (requireConfirm && password !== confirmPassword) {
                setMessage('Passwords do not match.', true);
                return null;
            }
            return { email: email, password: password };
        }

        async function requestPasswordReset() {
            const email = emailInput.value.trim();
            if (!email) {
                setMessage('Enter your email first, then request a reset link.', true);
                return;
            }
            setBusy(true);
            const { error } = await state.client.auth.resetPasswordForEmail(email, {
                redirectTo: sessionRedirectUrl(true)
            });
            setBusy(false);
            if (error) {
                console.error('[auth] resetPasswordForEmail failed', error);
                setMessage(formatAuthError(error, 'Failed to send reset email.'), true);
                return;
            }
            setMessage('Reset link sent. Check your inbox and open it in this browser.', false);
        }

        topAuthBtn.addEventListener('click', openModal);
        topSignoutBtn.addEventListener('click', async function() {
            await state.client.auth.signOut();
        });
        if (brandEl) {
            brandEl.addEventListener('click', function() {
                if (!state.session) {
                    openModal();
                    return;
                }
                toggleBrandMenu();
            });
            brandEl.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (!state.session) {
                        openModal();
                        return;
                    }
                    toggleBrandMenu();
                }
            });
        }
        if (brandAccountSettingsBtn) {
            brandAccountSettingsBtn.addEventListener('click', function() {
                closeBrandMenu();
                openAccountSettingsModal();
            });
        }
        if (brandAccountSignoutBtn) {
            brandAccountSignoutBtn.addEventListener('click', async function() {
                closeBrandMenu();
                await state.client.auth.signOut();
            });
        }
        if (accountSettingsOpenHomeBtn) {
            accountSettingsOpenHomeBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname.indexOf('/rules/') >= 0 || window.location.pathname.indexOf('/about/') >= 0 ? '../' : './';
            });
        }
        if (accountSettingsOpenRulesBtn) {
            accountSettingsOpenRulesBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname.indexOf('/about/') >= 0 ? '../rules/' : (window.location.pathname.indexOf('/rules/') >= 0 ? './' : 'rules/');
            });
        }
        if (accountSettingsOpenAboutBtn) {
            accountSettingsOpenAboutBtn.addEventListener('click', function() {
                window.location.href = window.location.pathname.indexOf('/rules/') >= 0 ? '../about/' : (window.location.pathname.indexOf('/about/') >= 0 ? './' : 'about/');
            });
        }
        if (accountSettingsSaveBtn) {
            accountSettingsSaveBtn.addEventListener('click', function() {
                if (!state.session) return;
                const nextSettings = readSettingsForm();
                persistSettings(nextSettings);
                applyUserSettings(nextSettings);
                setAccountSettingsMessage('Settings saved.', false);
            });
        }
        if (accountSettingsCancelBtn) {
            accountSettingsCancelBtn.addEventListener('click', closeAccountSettingsModal);
        }
        if (accountSettingsCloseXBtn) {
            accountSettingsCloseXBtn.addEventListener('click', closeAccountSettingsModal);
        }
        if (accountSettingsModal) {
            accountSettingsModal.addEventListener('click', function(event) {
                if (event.target === accountSettingsModal) closeAccountSettingsModal();
            });
        }

        modeSigninBtn.addEventListener('click', function() {
            setMode('signin');
            passwordInput.focus();
        });

        modeRegisterBtn.addEventListener('click', function() {
            setMode('register');
            passwordInput.focus();
        });

        forgotBtn.addEventListener('click', requestPasswordReset);
        backToLoginBtn.addEventListener('click', function() {
            setMode('signin');
            emailInput.focus();
        });

        loginBtn.addEventListener('click', async function() {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                setMessage('Email and password are required.', true);
                return;
            }

            setBusy(true);
            const { error } = await state.client.auth.signInWithPassword({ email: email, password: password });
            setBusy(false);
            if (error) {
                setMessage(error.message || 'Sign in failed.', true);
                return;
            }
            closeModal();
        });

        registerBtn.addEventListener('click', async function() {
            const form = validateAuthFields(true);
            if (!form) return;

            setBusy(true);
            const { data, error } = await state.client.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    emailRedirectTo: sessionRedirectUrl(false)
                }
            });
            if (error) {
                setMessage(formatAuthError(error, 'Registration failed.'), true);
                setBusy(false);
                return;
            }
            setBusy(false);
            if (data && data.session) {
                closeModal();
                return;
            }
            setMessage('Account created. Confirm your email, then log in.', false);
        });

        resetBtn.addEventListener('click', async function() {
            const form = validateAuthFields(true);
            if (!form) return;

            setBusy(true);
            const recoverySession = await state.client.auth.getSession();
            if (!(recoverySession && recoverySession.data && recoverySession.data.session)) {
                setMessage('Open the password reset link from your email, then try again.', true);
                setBusy(false);
                return;
            }
            const { error } = await state.client.auth.updateUser({ password: form.password });
            if (error) {
                setMessage(error.message || 'Password update failed.', true);
                setBusy(false);
                return;
            }
            setBusy(false);
            clearRecoveryFlowMarkers();
            setMode('signin');
            closeModal();
        });

        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(event) {
            if (event.target === modal) closeModal();
        });
        document.addEventListener('click', function(event) {
            if (!brandEl || !brandAccountMenu || brandAccountMenu.hidden) return;
            if (!brandEl.contains(event.target) && !brandAccountMenu.contains(event.target)) {
                closeBrandMenu();
            }
        });

        window.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
                closeBrandMenu();
                closeAccountSettingsModal();
            }
        });

        state.userSettings = loadSettings();
        applyUserSettings(state.userSettings);

        async function runInitialAuthSync() {
            if (isRecoveryFlow()) {
                await hydrateRecoverySessionFromHash();
                openModal('reset');
            }
            const result = await state.client.auth.getSession();
            syncTopbar(result && result.data ? result.data.session : null);
        }
        runInitialAuthSync();

        state.client.auth.onAuthStateChange(function(event, session) {
            if (event === 'PASSWORD_RECOVERY') {
                openModal('reset');
            }
            syncTopbar(session);
        });
    })();
});
