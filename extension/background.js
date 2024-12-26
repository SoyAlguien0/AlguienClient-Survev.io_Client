chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      if (details.url.includes('app-')) {
        return { cancel: true };
      }
    },
    { urls: ["<all_urls>"] }, 
    ["blocking"]
  );
  