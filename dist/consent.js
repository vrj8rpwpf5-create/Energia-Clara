(function () {
  'use strict';
  const key = 'calculawatt-consent-v1';
  const banner = document.getElementById('cookie-banner');
  const settings = document.getElementById('cookie-settings');
  const analytics = document.getElementById('cookie-analytics');
  const open = document.getElementById('cookie-open');
  let tagLoaded = false;

  function saved() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value.analytics === 'boolean' ? value : null;
    } catch (_) { return null; }
  }

  function removeAnalyticsCookies() {
    document.cookie.split(';').forEach(function (part) {
      const name = part.trim().split('=')[0];
      if (!/^(_ga($|_)|_gid$|_gat($|_))/.test(name)) return;
      const domains = ['', '; domain=' + location.hostname, '; domain=.' + location.hostname.replace(/^www\./, '')];
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax';
      });
    });
  }

  function apply(choice) {
    // AdSense connection tag is installed; a certified CMP is still pending. Advertising stays denied.
    gtag('consent', 'update', {
      analytics_storage: choice.analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (choice.analytics && !tagLoaded) {
      tagLoaded = true;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-RM031EJ6TZ';
      document.head.appendChild(script);
      gtag('js', new Date());
      gtag('config', 'G-RM031EJ6TZ');
    } else if (!choice.analytics) {
      removeAnalyticsCookies();
    }
  }

  function save(choice) {
    const wasActive = tagLoaded;
    apply(choice);
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch (_) {}
    banner.hidden = true;
    settings.hidden = true;
    // A previously loaded Google tag is removed by navigation after revocation.
    if (wasActive && !choice.analytics) location.reload();
  }

  document.getElementById('cookie-accept').addEventListener('click', function () { save({analytics: true}); });
  document.getElementById('cookie-reject').addEventListener('click', function () { save({analytics: false}); });
  document.getElementById('cookie-configure').addEventListener('click', function () {
    analytics.checked = !!(saved() || {}).analytics;
    settings.hidden = false;
    banner.hidden = true;
    document.getElementById('cookie-settings-title').focus();
  });
  document.getElementById('cookie-save').addEventListener('click', function () { save({analytics: analytics.checked}); });
  open.addEventListener('click', function () {
    analytics.checked = !!(saved() || {}).analytics;
    settings.hidden = false;
    banner.hidden = true;
    document.getElementById('cookie-settings-title').focus();
  });

  const choice = saved();
  if (choice) apply(choice);
  else banner.hidden = false;
}());
