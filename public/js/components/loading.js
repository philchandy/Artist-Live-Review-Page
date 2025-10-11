// public/js/components/loading.js
export function showLoading(message = 'Loading...') {
  return `
    <div class="loading-container">
      <img src="/img/vinyl.png" alt="Loading" class="loading-spinner" />
      <p class="loading-text">${message}</p>
    </div>
  `;
}

export function showError(message = 'Something went wrong. Please try again.') {
  return `
    <div class="error-container">
      <p class="error-text">⚠️ ${message}</p>
    </div>
  `;
}

export function showEmpty(message = 'No items found.') {
  return `
    <div class="empty-container">
      <p class="empty-text">${message}</p>
    </div>
  `;
}
