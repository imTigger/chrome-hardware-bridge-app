document.addEventListener('chromeHardwareEvent', function(evt) {
	if (chrome.extension) {
		chrome.extension.sendRequest(evt.detail);
	} else {
		alert('Internal error. Please reload this page and try again.');
	}
});