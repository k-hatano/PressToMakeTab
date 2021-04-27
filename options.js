
document.getElementById("duration").addEventListener("change", onDurationChanged);
document.getElementById("duration").addEventListener("input", onDurationChanged);
document.getElementById("activate").addEventListener("change", onActivateChanged);
document.getElementById("activate").addEventListener("input", onActivateChanged);
document.getElementById("exception_sites").addEventListener("change", onExceptionSitesChanged);
document.getElementById("exception_sites").addEventListener("input", onExceptionSitesChanged);
restoreOptions();

function onDurationChanged(event) {
	var duration = parseInt(event.target.value);
	var durationSpan = document.getElementById("duration_span");
	durationSpan.innerText = "" + (duration * 100) + " ms";

	chrome.storage.sync.set({
		duration: duration
	}, function(){});
}

function onActivateChanged(event) {
	var activate = event.target.checked ? true : false;
	console.dir(event);
	
	chrome.storage.sync.set({
		activate: activate
	}, function(){});
}

function onExceptionSitesChanged(event) {
	var exceptionSites = event.target.value;
	
	chrome.storage.sync.set({
		exceptionSites: exceptionSites
	}, function(){});
}

function restoreOptions() {
	chrome.storage.sync.get({
		duration: 5,
		exceptionSites: "",
		activate: false
	}, function(items) {
		document.getElementById("duration").value = parseInt(items.duration);
		document.getElementById("duration_span").innerText = "" + (parseInt(items.duration) * 100) + " ms";
		document.getElementById("exception_sites").value = items.exceptionSites;
		document.getElementById("activate").checked = items.activate ? "checked" : undefined;
	});
}
