
export function register(config?: any) {
  if ('serviceWorker' in navigator) {
    // Determine the service worker URL relative to the origin
    const swUrl = new URL('service-worker.js', window.location.origin + '/').href;

    const registerFn = () => {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content is available; please close all tabs to update.');
                } else {
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          // "InvalidStateError" happens if the document is unloading or in a restricted sandbox.
          // We catch it specifically to prevent application-breaking console errors in previewers.
          if (error.name === 'InvalidStateError' || error.message?.includes('invalid state')) {
            console.warn('Service Worker registration delayed or skipped: Document is not in an active state.');
          } else {
            console.error('Error during service worker registration:', error);
          }
        });
    };

    // If the page is already loaded, register immediately. 
    // Otherwise, wait for the load event to ensure a stable document state.
    if (document.readyState === 'complete') {
      registerFn();
    } else {
      window.addEventListener('load', registerFn);
    }
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
