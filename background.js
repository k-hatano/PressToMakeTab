
chrome.runtime.onMessage.addListener(function(params) {
	if (params.type == "newTab"){
		chrome.tabs.create({ url: params.url, active: params.activate });
	}
});
