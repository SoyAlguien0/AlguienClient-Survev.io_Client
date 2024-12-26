const script = document.createElement('script');
script.src = chrome.runtime.getURL('AlguienClient.js');
script.type = 'module';
document.head.appendChild(script);
