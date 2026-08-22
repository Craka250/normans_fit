/**
 * VYRON Fitness
 * Member Page Authentication Guard
 *
 * Add this script to every protected/member page.
 */

(() => {
    'use strict';

    const SESSION_KEY = 'vyron_session_v1';

    const PUBLIC_PAGES = new Set([
        'index.html',
        'signup.html',
        'login.html',
        'forgot-password.html',
        'reset-password.html',
        ''
    ]);

    /**
     * Read and validate the current authentication session.
     */
    function getSession() {
        try {
            const stored = localStorage.getItem(SESSION_KEY);

            if (!stored) {
                return null;
            }

            const session = JSON.parse(stored);

            if (!session || typeof session !== 'object') {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }

            /*
             * Automatically remove expired sessions.
             */
            if (
                session.expiresAt &&
                Date.now() > Number(session.expiresAt)
            ) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }

            return session;

        } catch (error) {
            console.error('VYRON authentication session error:', error);

            localStorage.removeItem(SESSION_KEY);

            return null;
        }
    }

    /**
     * Get the current page filename.
     */
    function getCurrentPage() {
        return (
            location.pathname
                .split('/')
                .pop()
                ?.toLowerCase() || 'index.html'
        );
    }

    const currentSession = getSession();
    const currentPage = getCurrentPage();

    /*
     * Allow public pages without authentication.
     */
    if (PUBLIC_PAGES.has(currentPage)) {
        window.VyronAuthGuard = {
            isAuthenticated: Boolean(currentSession),
            session: currentSession
        };

        return;
    }

    /*
     * Protect all other pages.
     */
    if (!currentSession) {
        const requestedUrl = `${location.pathname}${location.search}${location.hash}`;

        const loginUrl = new URL(
            'auth/login.html',
            `${location.origin}${location.pathname}`
        );

        loginUrl.searchParams.set('redirect', requestedUrl);

        location.replace(loginUrl.href);

        return;
    }

    /*
     * Expose authentication state to the page.
     */
    window.VyronAuthGuard = {
        isAuthenticated: true,
        session: currentSession
    };

})();
