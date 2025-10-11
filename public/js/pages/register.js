export function renderRegisterPage() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <header class="header">
      <div class="container header-content">
        <div class="logo">🎤 LiveLy</div>
        <nav class="navbar">
          <ul>
            <li><a href="#/">Home</a></li>
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
        <h1>Create an Account</h1>
        <p class="sub">Join the LiveLy community and start sharing reviews.</p>

        <form id="register-form" novalidate>
          <div class="field">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="yourname" required>
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com" required>
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required minlength="6">
          </div>

          <button class="btn" type="submit">Register</button>
          <div id="formStatus" class="form-status"></div>
        </form>

        <p class="alt">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </section>
    </main>

    <footer class="footer">
      <p class="alt">
      Already have an account? <a href="#/login">Log in</a>
      </p>

    </footer>
  `;

  const form = document.getElementById('register-form');
  const formStatus = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.textContent = '';

    const formData = {
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
    };

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      formStatus.textContent = 'All fields are required';
      formStatus.style.color = '#c62828';
      return;
    }

    if (formData.password.length < 6) {
      formStatus.textContent = 'Password must be at least 6 characters';
      formStatus.style.color = '#c62828';
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.hash = '#/';
      } else {
        formStatus.textContent = data.error || 'Registration failed';
        formStatus.style.color = '#c62828';
      }
    } catch (error) {
      formStatus.textContent = 'Network error. Please try again.';
      formStatus.style.color = '#c62828';
    }
  });
}
