
function ce(el) {
	return document.createElement(el);
}

function gi(el) {
	return document.getElementById(el);
}

function gc(el, d) {
	return d.querySelectorAll(el)[0];
}

function gca(el) {
	return document.querySelectorAll(el);
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
