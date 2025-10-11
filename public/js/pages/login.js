export function renderLoginPage() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <header class="header">
      <div class="container header-content">
        <div class="logo">🎤 LiveLy</div>
        <nav class="navbar">
          <ul>
            <li><a href="#/">Home</a></li><li>
            <li><a href="#/browse">Browse Artists</a></li>
            <li><a href="#/review">Leave a Review</a></li>
            <li><a href="#/login">Login</a></li>
            <li><a href="#/register" class="active">Register</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <img src="/img/vinyl.png" alt="Spinning vinyl record" class="vinyl-img" />
    <img src="/img/needle.png" alt="Record Player Needle" class="needle-img" />

    <main class="container auth-wrap">
      <section class="auth-card">
        <h1>Welcome back</h1>
        <p class="sub">Log in to review and rate live performances.</p>

        <form id="login-form" novalidate>
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com" required>
            <small class="error" id="emailError"></small>
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required>
            <small class="error" id="passwordError"></small>
          </div>

          <button class="btn" type="submit">Log in</button>
          <div class="form-status" id="formStatus" role="alert" aria-live="polite"></div>
        </form>

        <p class="alt">
          Don't have an account? <a href="/register">Create one</a>
        </p>
      </section>
    </main>

    <footer class="footer">
      <p class="alt">
      Already have an account? <a href="#/login">Log in</a>
      </p>
    </footer>
  `;

  const form = document.getElementById('login-form');
  const formStatus = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.textContent = '';

    const formData = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    };

    // Validation
    if (!formData.email || !formData.password) {
      formStatus.textContent = 'All fields are required';
      formStatus.style.color = '#c62828';
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.hash = '#/';
      } else {
        formStatus.textContent = data.error || 'Login failed';
        formStatus.style.color = '#c62828';
      }
    } catch (error) {
      formStatus.textContent = 'Network error. Please try again.';
      formStatus.style.color = '#c62828';
    }
  });
}
