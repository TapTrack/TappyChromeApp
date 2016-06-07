/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function(launchData) {
  chrome.app.window.create(
    'pages/index.html',
    {
      id: 'TappyRW',
      bounds: {width: 1280, height: 800},
      resizable: true,
        frame: 'none'
    }
  );
});
