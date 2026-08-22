# VYRON Authentication Integration

## Files

Copy `auth/` and `js/auth-guard.js` into the matching locations in the VYRON project.

### Public authentication pages
- `auth/signup.html`
- `auth/login.html`
- `auth/forgot-password.html`
- `auth/reset-password.html`
- `auth/auth.css`
- `auth/auth.js`

### Protection
- `js/auth-guard.js`

## Homepage links

Change the desktop login link to:
```html
<a href="auth/login.html" class="login-link">Login</a>
```

Change mobile login to:
```html
<a href="auth/login.html" class="mobile-nav-link"><span>09</span>Login</a>
```

Change Get Started to:
```html
<a href="auth/signup.html" class="btn btn-primary nav-cta">Get Started <i class="fa-solid fa-arrow-right"></i></a>
```

Use `auth/signup.html` for member CTAs such as Start Your Journey / Become a Member.

## Protect every member page

Immediately before `</head>` on each protected page:
```html
<script src="js/auth-guard.js" defer></script>
```

Recommended protected pages:
- programs.html
- trainers.html
- members.html
- nutrition.html
- gallery.html
- about.html
- contact.html

Keep `index.html` public if you want visitors to see the landing page before registering.

## Registered user counter

Accounts are temporarily tracked in `localStorage` under `vyron_users_v1`. The signup page already displays:
```html
<strong data-user-count>0</strong>
```

To display the count on the homepage, add:
```html
<span data-user-count-value>0</span>
```

and before `</body>`:
```html
<script>
document.addEventListener('DOMContentLoaded',()=>{
  try{
    const users=JSON.parse(localStorage.getItem('vyron_users_v1')||'[]');
    document.querySelectorAll('[data-user-count-value]').forEach(el=>el.textContent=(Array.isArray(users)?users.length:0).toLocaleString());
  }catch{}
});
</script>
```

## Logout

Use:
```html
<button type="button" data-vyron-logout>Logout</button>
<script>
document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-vyron-logout]').forEach(b=>b.onclick=()=>{localStorage.removeItem('vyron_session_v1');location.href='auth/login.html';}));
</script>
```

## Security boundary

This is a frontend development adapter, not final production authentication. It does not store plaintext passwords; it derives a PBKDF2 verifier with a per-user salt. However, localStorage is not a secure authorization boundary.

For production, the backend must enforce authorization and use HTTPS, Argon2id/bcrypt password hashing, unique email constraints, server-side validation, rate limiting, CSRF protection where appropriate, Secure/HttpOnly/SameSite cookies, short-lived sessions, server-side password-reset tokens and email-based recovery. The reset token must not be exposed in the page in a production implementation.
