
var appendedAnchorsIndex = 0;
var mutationObserver = undefined;

var pressedAnchor = undefined;
var pressedTimeout = undefined;
var pressedTime = 0;

var performedAnchor = undefined; // タブ作成を行ったアンカー
var hoveringAnchor = undefined; // クリック以降マウスポインタが入ったままのアンカー

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

function onWindowLoaded(loadedEvent) {
	resetAllVariables();
	var anchors = document.getElementsByTagName("a");
	for (var i = 0; i < anchors.length; i++) {
		anchors[i].addEventListener("click", onClickOnAnchor, {capture: true});
		anchors[i].addEventListener("mousedown", onMouseDownOnAnchor, {capture: true});
		anchors[i].addEventListener("mouseup", onMouseUpOnAnchor, {capture: true});
		anchors[i].addEventListener("mousemove", onMouseMoveOnAnchor, {capture: true});
		anchors[i].addEventListener("mouseout", onMouseOutOnAnchor, {capture: true});
		anchors[i].addEventListener("mouseout", onMouseLeaveOnAnchor, {capture: true});
	}
}

function onClickOnAnchor(clickEvent) {
	if (clickEvent.button != 0 && clickEvent.button != 2) {
		return true;
	}
	if (clickEvent.target.isEqualNode(performedAnchor)) {
		performedAnchor = undefined;
		clickEvent.preventDefault();
		return false;
	}
	return false;
}

function onMouseDownOnAnchor(downEvent) {
	if (downEvent.button != 0 && downEvent.button != 2) {
		return true;
	}
	if (pressedTimeout != undefined) {
		return false;
	}
	if (hoveringAnchor == downEvent.target) {
		return false;
	}
	var downingEvent = downEvent;
	restoreOptions(function(){
		for (var j = 0; j < exceptionSites.length; j++) {
			if (exceptionSites[j].length > 0 && document.URL.indexOf(exceptionSites[j]) >= 0) {
				return;
			}
		}

		startX = downingEvent.clientX;
		startY = downingEvent.clientY;
		currentX = downingEvent.clientX;
		currentY = downingEvent.clientY;

		pressedAnchor = downingEvent.target;
		hoveringAnchor = downingEvent.target;
		pressedTime = new Date();
		pressedTimeout = setTimeout(onTicksTakenOnPressedAnchor, duration);
	});
	return false;
}

function onMouseMoveOnAnchor(moveEvent) {
	if (moveEvent.button != 0 && moveEvent.button != 2) {
		return true;
	}
	currentX = moveEvent.clientX;
	currentY = moveEvent.clientY;
	return false;
}

function onMouseOutOnAnchor(outEvent) {
	hoveringAnchor = undefined;
	pressedAnchor = undefined;
	if (pressedTimeout != undefined) {
		clearTimeout(pressedTimeout);
		pressedTimeout = undefined;
	}
}

function onMouseLeaveOnAnchor(outEvent) {
	hoveringAnchor = undefined;
	pressedAnchor = undefined;
	if (pressedTimeout != undefined) {
		clearTimeout(pressedTimeout);
		pressedTimeout = undefined;
	}
}

function onMouseUpOnAnchor(upEvent) {
	if (upEvent.button != 0 && upEvent.button != 2) {
		return true;
	}
	pressedAnchor = undefined;
	if (pressedTimeout != undefined) {
		clearTimeout(pressedTimeout);
		pressedTimeout = undefined;
		performedAnchor = undefined;
		upEvent.preventDefault();
		return false;
	}
}

function onTicksTakenOnPressedAnchor() {
	if (pressedAnchor != undefined) {
		var now = new Date();
		var latency = now - pressedTime;
		if (latency < duration * 1.5) { // durationの1.5倍以上掛かっていたら処理落ちとみなす
			var distance = getDistance(startX, startY, currentX, currentY);
			if (distance < 5) {
				performedAnchor = pressedAnchor;
				chrome.runtime.sendMessage({type: "newTab", url: extractAnchor(pressedAnchor).href, activate: activate}, function(){
					pressedTimeout = undefined;
				});
			}
		}
	}

	pressedTimeout = undefined;
}

function resetAllVariables() {
	pressedAnchor = undefined;
	pressedTimeout = undefined;
	performedAnchor = undefined;
	hoveringAnchor = undefined;
}

function extractAnchor(anElement) {
	while (anElement != undefined) {
		if (anElement.tagName.toLowerCase() == "a") {
			return anElement;
		}
		anElement = anElement.parentElement;
	}
	return undefined;
}

function getDistance(aX, aY, bX, bY) {
	return Math.sqrt( (bX - aX) * (bX - aX) + (bY - aY) * (bY - aY) );
}
