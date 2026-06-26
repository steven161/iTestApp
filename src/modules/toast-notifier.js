// Toast Notification Wrapper using Bootstrap 5
const ToastNotifier = {
  containerId: 'toastContainer',
  toastCount: 0,

  // Initialize toast container if it doesn't exist
  init() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
      console.log('[ToastNotifier] Container initialized');
    } else {
      console.log('[ToastNotifier] Container already exists');
    }
  },

  // Create and show toast
  show(message, type = 'info', delay = 3000) {
    console.log(`[ToastNotifier] Showing ${type} toast: ${message}`);
    this.init();

    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('[ToastNotifier] Container not found!');
      return;
    }
    this.toastCount++;
    const toastId = `toast-${this.toastCount}`;

    // Create toast element
    const toastDiv = document.createElement('div');
    toastDiv.id = toastId;
    toastDiv.className = `toast ${type}`;
    toastDiv.setAttribute('role', 'alert');
    toastDiv.setAttribute('aria-live', 'assertive');
    toastDiv.setAttribute('aria-atomic', 'true');
    toastDiv.style.cssText = `
      display: block;
      margin-top: 10px;
      min-width: 300px;
      pointer-events: auto;
    `;

    // Determine icon based on type
    const icon = this.getIcon(type);

    // Toast HTML structure
    toastDiv.innerHTML = `
      <div class="toast-container-inner" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 6px; background-color: ${this.getBackgroundColor(type)}; border-left: 4px solid ${this.getBorderColor(type)}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
        <span style="margin-right: 12px; font-size: 18px; flex-shrink: 0;">${icon}</span>
        <div style="flex: 1; color: ${this.getTextColor(type)}; font-weight: 500;">${message}</div>
        <button type="button" class="btn-close" style="background: none; border: none; opacity: 0.6; cursor: pointer; padding: 4px; margin-left: 12px; flex-shrink: 0;" aria-label="Close" onclick="this.closest('.toast').remove();"></button>
      </div>
    `;

    container.appendChild(toastDiv);
    console.log(`[ToastNotifier] Toast ${toastId} appended to container`);

    // Auto-dismiss
    if (delay > 0) {
      setTimeout(() => {
        if (document.getElementById(toastId)) {
          toastDiv.remove();
          console.log(`[ToastNotifier] Toast ${toastId} auto-dismissed`);
        }
      }, delay);
    }

    return toastDiv;
  },

  // Show success toast
  success(message, delay = 3000) {
    return this.show(message, 'success', delay);
  },

  // Show error toast
  error(message, delay = 3000) {
    return this.show(message, 'error', delay);
  },

  // Show warning toast
  warning(message, delay = 3000) {
    return this.show(message, 'warning', delay);
  },

  // Show info toast
  info(message, delay = 3000) {
    return this.show(message, 'info', delay);
  },

  // Get icon for toast type
  getIcon(type) {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  },

  // Get background color for type
  getBackgroundColor(type) {
    switch (type) {
      case 'success':
        return '#d4edda'; // Green
      case 'error':
        return '#f8d7da'; // Red
      case 'warning':
        return '#fff3cd'; // Yellow
      case 'info':
        return '#d1ecf1'; // Blue
      default:
        return '#f8f9fa'; // Gray
    }
  },

  // Get border color for type
  getBorderColor(type) {
    switch (type) {
      case 'success':
        return '#28a745'; // Green
      case 'error':
        return '#dc3545'; // Red
      case 'warning':
        return '#ffc107'; // Yellow
      case 'info':
        return '#17a2b8'; // Blue
      default:
        return '#6c757d'; // Gray
    }
  },

  // Get text color for type
  getTextColor(type) {
    switch (type) {
      case 'success':
        return '#155724'; // Dark green
      case 'error':
        return '#721c24'; // Dark red
      case 'warning':
        return '#856404'; // Dark yellow
      case 'info':
        return '#0c5460'; // Dark blue
      default:
        return '#333333'; // Dark gray
    }
  },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[ToastNotifier] DOMContentLoaded event fired');
  ToastNotifier.init();
  ToastNotifier.info('App loaded - Toast system ready!', 3000);
});
