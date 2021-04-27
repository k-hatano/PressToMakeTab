
var appendedAnchorsIndex = 0;
var mutationObserver = undefined;

var pressedAnchor = undefined;
var pressedTimeout = undefined;
var preventAnchor = undefined;

var duration = 500;
var exceptionSites = "";
var activate = false;

var startX, endX;
var currentX, currentY;

window.addEventListener("load", onWindowLoaded, false);

mutationObserver = new MutationObserver(onWindowLoaded);
mutationObserver.observe(document.body, {childList: true});

restoreOptions();

function restoreOptions(callback = undefined) {
	chrome.storage.sync.get({
		duration: 5,
		exceptionSites: "",
		activate: false
	}, function(items) {
		duration = parseInt(items.duration) * 100;
		exceptionSites = items.exceptionSites.replace(/\r\n?/g,"\n").split("\n");
		activate = items.activate;
		if (callback != undefined) {
			callback();
		}
	});
}

function onWindowLoaded(event) {
	resetAllVariables();
	var anchors = document.getElementsByTagName("a");
	for (var i = 0; i < anchors.length; i++) {
		if (anchors[i].onclick != undefined || anchors[i].onmousedown != undefined 
				|| anchors[i].onmouseup != undefined || anchors[i].onmousemove != undefined) {
			continue;
		}
		anchors[i].addEventListener("click", onClickOnAnchor, {capture: true});
		anchors[i].addEventListener("mousedown", onMouseDownOnAnchor, {capture: true});
		anchors[i].addEventListener("mouseup", onMouseUpOnAnchor, {capture: true});
		anchors[i].addEventListener("mousemove", onMouseMoveOnAnchor, {capture: true});
	}
}

function onClickOnAnchor(event) {
	if (event.target == preventAnchor) {
		preventAnchor = undefined;
		event.preventDefault();
		return false;
	}
}

function onMouseDownOnAnchor(event) {
	var downingEvent = event;
	restoreOptions(function(){
		for (var j = 0; j < exceptionSites.length; j++) {
			if (document.URL.indexOf(exceptionSites[j]) >= 0) {
				return;
			}
		}

		startX = downingEvent.clientX;
		startY = downingEvent.clientY;
		currentX = downingEvent.clientX;
		currentY = downingEvent.clientY;

		pressedAnchor = downingEvent.target;
		setTimeout(onTicksTakenOnPressedAnchor, duration);
	});
}

function onMouseMoveOnAnchor(event) {
	currentX = event.clientX;
	currentY = event.clientY;
}

function onMouseUpOnAnchor(event) {
	pressedAnchor = undefined;
	if (pressedTimeout != undefined) {
		clearTimeout(pressedTimeout);
		resetAllVariables();
	}
}

function onTicksTakenOnPressedAnchor() {
	if (pressedAnchor != undefined) {
		preventAnchor = pressedAnchor;
		var distance = getDistance(startX, startY, currentX, currentY);
		if (distance < 6) {
			chrome.runtime.sendMessage({type: "newTab", url: extractAnchor(pressedAnchor).href, activate: activate});
		}
	}

	pressedTimeout = undefined;
}

function resetAllVariables() {
	pressedAnchor = undefined;
	pressedTimeout = undefined;
	preventAnchor = undefined;
}

function extractAnchor(element) {
	while (element != undefined) {
		if (element.tagName.toLowerCase() == "a") {
			return element;
		}
		element = element.parentElement;
	}
	return undefined;
}

function getDistance(aX, aY, bX, bY) {
	return Math.sqrt( (bX - aX) * (bX - aX) + (bY - aY) * (bY - aY) );
}
