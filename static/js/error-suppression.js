// Global error suppression for extension and other non-critical errors
(function() {
  'use strict';
  
  // Suppress console errors from browser extensions
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Check if error is from browser extension
    const errorString = args.join(' ');
    if (errorString.includes('chrome-extension://') || 
        errorString.includes('moz-extension://') ||
        errorString.includes('safari-extension://') ||
        errorString.includes('Failed to initialize messaging') ||
        errorString.includes('tx_attempts_exceeded') ||
        errorString.includes('tx_ack_timeout')) {
      // Silently ignore extension errors
      return;
    }
    
    // Allow other errors to be logged normally
    originalConsoleError.apply(console, args);
  };
  
  // Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', function(event) {
    const errorString = event.reason ? event.reason.toString() : '';
    if (errorString.includes('chrome-extension://') || 
        errorString.includes('moz-extension://') ||
        errorString.includes('safari-extension://') ||
        errorString.includes('Failed to initialize messaging') ||
        errorString.includes('tx_attempts_exceeded') ||
        errorString.includes('tx_ack_timeout')) {
      // Prevent the error from being displayed
      event.preventDefault();
      return;
    }
  });
  
  // Suppress global errors from extensions
  window.addEventListener('error', function(event) {
    const errorString = event.message || '';
    const sourceString = event.filename || '';
    
    if (sourceString.includes('chrome-extension://') || 
        sourceString.includes('moz-extension://') ||
        sourceString.includes('safari-extension://') ||
        errorString.includes('Failed to initialize messaging') ||
        errorString.includes('tx_attempts_exceeded') ||
        errorString.includes('tx_ack_timeout')) {
      // Prevent the error from being displayed
      event.preventDefault();
      return;
    }
  });
  
  console.log('Error suppression initialized - extension errors will be silenced');
})();