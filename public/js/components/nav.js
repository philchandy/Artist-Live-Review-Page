// public/js/components/nav.js
export function renderNav(currentUser, activePage = '') {
  const navLinks = currentUser
    ? `<li><span>👤 ${currentUser.username}</span></li>
       <li><a href="#/my-reviews">My Reviews</a></li>
       ${currentUser.role === 'admin' ? '<li><a href="#/admin">Admin</a></li>' : ''}
       <li><a href="#" id="logoutBtn">Logout</a></li>`
    : `<li><a href="#/login">Login</a></li>
       <li><a href="#/register">Register</a></li>`;

  return `
    <header class="header">
      <div class="container header-content">
        <div class="logo">🎤 LiveLy</div>
        <nav class="navbar">
          <ul>
            <li><a href="#/" ${activePage === 'home' ? 'class="active"' : ''}>Home</a></li>
            <li><a href="#/browse" ${activePage === 'browse' ? 'class="active"' : ''}>Browse Artists</a></li>
            ${currentUser ? `<li><a href="#/review" ${activePage === 'review' ? 'class="active"' : ''}>Leave a Review</a></li>` : ''}
            ${navLinks}
          </ul>
        </nav>
      </div>
    </header>
  `;
}

export function attachLogoutHandler() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/api/logout', { method: 'POST' });
      window.location.hash = '#/';
      window.location.reload();
    });
  }
}

export async function checkUser() {
  try {
    const res = await fetch('/api/me');
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
