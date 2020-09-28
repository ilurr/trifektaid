// swipe
function initSwipe() {
	let swipe = document.querySelectorAll('[data-swipe]');
	if(!!swipe) {
		console.log(swipe.length);
		swipe.forEach(function(item, index){
			console.log(item);
			getSwipe(item);
		});
	}
}

function getSwipe(el) {
	let mc = new Hammer(el);
	mc.get('swipe').set({
		direction: Hammer.DIRECTION_ALL,
		threshold: 5 
	});
	mc.on("swipeleft swiperight", function(ev) {
		let dir = ev.type;
		console.log(dir);
		rotateSwipe(dir, el);
	});
}

function rotateSwipe(dir, el) {
	el.classList.add('discover-'+dir);
}

