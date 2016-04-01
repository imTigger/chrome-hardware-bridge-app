document.addEventListener('chromeHardwareEvent', function(evt) {
	chrome.extension.sendRequest(evt.detail);
});