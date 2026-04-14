(function() {
    if (document.documentElement.classList.contains('low-end-mode')) return;

    try {
        var settingsRaw = window.localStorage.getItem('pv_site_settings_v3');
        if (settingsRaw) {
            var settings = JSON.parse(settingsRaw);
            if (settings && (settings.minEffects === true || settings.liteMode === true)) return;
        }
    } catch (_settingsErr) {
        // Ignore settings parse failures.
    }

    var config = window.PV_SUPABASE || {};
    if (!config.url || !config.anonKey) return;

    var endpoint = config.url.replace(/\/$/, '') + '/rest/v1/site_events';
    var pagePath = window.location.pathname.replace(/\/index\.html$/, '/');

    function sendEvent(payload) {
        var body = JSON.stringify(payload);
        var headers = {
            'Content-Type': 'application/json',
            'apikey': config.anonKey,
            'Authorization': 'Bearer ' + config.anonKey,
            'Prefer': 'return=minimal'
        };

        fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: body,
            keepalive: true
        }).catch(function() {});
    }

    function startTracking() {
        sendEvent({
            event_type: 'page_view',
            page_path: pagePath,
            href: window.location.href,
            referrer: document.referrer || null
        });

        document.addEventListener('click', function(event) {
            var target = event.target;
            if (!target || typeof target.closest !== 'function') return;
            var link = target.closest('a[href]');
            if (!link) return;

            var nextUrl;
            try {
                nextUrl = new URL(link.href, window.location.href);
            } catch (_err) {
                return;
            }

            var targetPath = nextUrl.pathname.replace(/\/index\.html$/, '/');
            if (nextUrl.origin === window.location.origin && targetPath !== pagePath) {
                sendEvent({
                    event_type: 'nav_click',
                    page_path: pagePath,
                    target_path: targetPath,
                    href: nextUrl.href
                });
            }
        }, { passive: true });
    }

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startTracking, { timeout: 1500 });
    } else {
        setTimeout(startTracking, 500);
    }
})();
