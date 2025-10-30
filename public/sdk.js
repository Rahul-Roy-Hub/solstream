(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    baseUrl: window.location.protocol + '//' + window.location.host,
    buttonClass: 'crypto-pay-button',
    checkoutUrl: '/checkout'
  };

  // Utility functions
  function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  function addStyles() {
    if (document.getElementById('crypto-pay-styles')) return;
    
    const style = createElement('style', { id: 'crypto-pay-styles' }, `
      .crypto-pay-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 16px;
        font-weight: 600;
        padding: 12px 24px;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        min-width: 120px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }
      
      .crypto-pay-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
      
      .crypto-pay-button:active {
        transform: translateY(0);
      }
      
      .crypto-pay-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      
      .crypto-pay-icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>') no-repeat center;
        background-size: contain;
      }
    `);
    
    document.head.appendChild(style);
  }

  // Button class
  class CryptoPayButton {
    constructor(element, config) {
      this.element = element;
      this.config = { ...config };
      this.buttonElement = null;
      this.isLoading = false;
      
      this.init();
    }

    init() {
      this.createButton();
      this.bindEvents();
    }

    createButton() {
      const button = createElement('button', {
        class: CONFIG.buttonClass,
        'data-button-id': this.config.buttonId
      });
      
      const icon = createElement('span', { class: 'crypto-pay-icon' });
      const text = createElement('span', {}, this.config.text || 'Pay with Crypto');
      
      button.appendChild(icon);
      button.appendChild(text);
      
      this.element.innerHTML = '';
      this.element.appendChild(button);
      this.buttonElement = button;
    }

    bindEvents() {
      this.buttonElement.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleClick();
      });
    }

    async handleClick() {
      if (this.isLoading) return;
      
      this.setLoading(true);
      
      try {
        // Fetch button configuration
        const response = await fetch(`${CONFIG.baseUrl}/api/buttons/${this.config.buttonId}`);
        
        if (!response.ok) {
          throw new Error('Button not found or inactive');
        }
        
        const buttonConfig = await response.json();
        
        // Open checkout in popup
        const popup = this.openCheckout(buttonConfig);
        
        // Handle popup events
        this.handlePopupEvents(popup, buttonConfig);
        
      } catch (error) {
        console.error('CryptoPay Error:', error);
        this.handleError(error.message);
      } finally {
        this.setLoading(false);
      }
    }

    openCheckout(buttonConfig) {
      const width = 500;
      const height = 700;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);
      
      const checkoutUrl = new URL(CONFIG.checkoutUrl, CONFIG.baseUrl);
      checkoutUrl.searchParams.set('buttonId', buttonConfig.id);
      
      return window.open(
        checkoutUrl.toString(),
        'crypto-pay-checkout',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
    }

    handlePopupEvents(popup, buttonConfig) {
      if (!popup) {
        this.handleError('Popup blocked');
        return;
      }

      // Check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          this.handlePopupClose();
        }
      }, 1000);

      // Listen for messages from popup
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'crypto-pay-success') {
          clearInterval(checkClosed);
          this.handleSuccess(event.data);
          popup.close();
        } else if (event.data.type === 'crypto-pay-error') {
          clearInterval(checkClosed);
          this.handleError(event.data.message);
          popup.close();
        }
      };

      window.addEventListener('message', messageHandler);

      // Cleanup when popup closes
      popup.addEventListener('beforeunload', () => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
      });
    }

    handleSuccess(data) {
      if (this.config.onSuccess) {
        this.config.onSuccess(data);
      } else {
        console.log('Payment successful:', data);
      }
    }

    handleError(message) {
      if (this.config.onError) {
        this.config.onError(new Error(message));
      } else {
        alert('Payment Error: ' + message);
      }
    }

    handlePopupClose() {
      if (this.config.onClose) {
        this.config.onClose();
      }
    }

    setLoading(loading) {
      this.isLoading = loading;
      
      if (this.buttonElement) {
        this.buttonElement.disabled = loading;
        
        if (loading) {
          this.buttonElement.innerHTML = `
            <span class="crypto-pay-icon" style="background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\" opacity=\"0.3\"/><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z\"/></svg>') no-repeat center; background-size: contain; animation: spin 1s linear infinite;"></span>
            <span>Loading...</span>
          `;
        } else {
          this.createButton();
        }
      }
    }
  }

  // Initialize SDK
  function init() {
    addStyles();
    
    // Find all script tags with data-button-id
    const scripts = document.querySelectorAll('script[data-button-id]');
    
    scripts.forEach(script => {
      const buttonId = script.getAttribute('data-button-id');
      const containerId = script.getAttribute('data-container');
      const text = script.getAttribute('data-text');
      const onSuccess = script.getAttribute('data-on-success');
      const onError = script.getAttribute('data-on-error');
      const onClose = script.getAttribute('data-on-close');
      
      if (!buttonId) {
        console.error('CryptoPay: data-button-id is required');
        return;
      }
      
      let container;
      
      if (containerId) {
        container = document.getElementById(containerId);
      } else {
        // Create container after the script tag
        container = document.createElement('div');
        script.parentNode.insertBefore(container, script.nextSibling);
      }
      
      if (!container) {
        console.error('CryptoPay: Container not found');
        return;
      }
      
      // Parse callback functions if provided
      let onSuccessFn, onErrorFn, onCloseFn;
      
      try {
        if (onSuccess) onSuccessFn = new Function('return ' + onSuccess)();
        if (onError) onErrorFn = new Function('return ' + onError)();
        if (onClose) onCloseFn = new Function('return ' + onClose)();
      } catch (e) {
        console.error('CryptoPay: Invalid callback function');
      }
      
      new CryptoPayButton(container, {
        buttonId,
        text,
        onSuccess: onSuccessFn,
        onError: onErrorFn,
        onClose: onCloseFn
      });
    });
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Add spin animation
  const spinStyle = createElement('style', {}, `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `);
  document.head.appendChild(spinStyle);

})();
