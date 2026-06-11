// MailerLite Universal loader
(function (w, d, e, u, f, l, n) {
	w[f] = w[f] || function () {
		(w[f].q = w[f].q || []).push(arguments);
	};
	l = d.createElement(e);
	l.async = 1;
	l.src = u;
	n = d.getElementsByTagName(e)[0];
	n.parentNode.insertBefore(l, n);
})(window, document, 'script', 'https://assets.mailerlite.com/js/universal.js', 'ml');

ml('account', '2324289');

document.addEventListener('DOMContentLoaded', function () {
	var dismissedSessionKey = 'pass_ml_dismissed_session';
	var fileName = (window.location.pathname.split('/').pop() || '').toLowerCase();
	var isHomepage = fileName === '' || fileName === 'index.html' || fileName === 'index.htm';

	function hasBeenDismissedThisSession() {
		try {
			return sessionStorage.getItem(dismissedSessionKey) === '1';
		} catch (error) {
			return false;
		}
	}

	function markDismissedThisSession() {
		try {
			sessionStorage.setItem(dismissedSessionKey, '1');
		} catch (error) {
			// Ignore storage errors.
		}
	}

	if (!isHomepage) {
		return;
	}

	if (hasBeenDismissedThisSession()) {
		return;
	}

	setTimeout(function () {
		if (hasBeenDismissedThisSession()) {
			return;
		}
		// Suppress additional auto-opens in this tab session after first display.
		markDismissedThisSession();
		ml('show', 'cwuKzg', true);
	}, 2000);
});

