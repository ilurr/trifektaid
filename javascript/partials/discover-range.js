var rng = document.getElementById("discoverFilterRange");

if(!!rng) {
	var listener = function () {
		//window.requestAnimationFrame(function () {
			document.getElementById("discoverFilterRangeValue").innerHTML = rng.value;
		//});
	};
	
	rng.addEventListener("mousedown", function () {
		listener();
		rng.addEventListener("mousemove", listener);
	});
	rng.addEventListener("mouseup", function () {
		rng.removeEventListener("mousemove", listener);
	});

	// mobile
	rng.addEventListener("input", function () {
		listener();
		rng.addEventListener("change", listener);
	});
	rng.addEventListener("change", function () {
		listener();
		rng.removeEventListener("input", listener);
	});
	  
	// include the following line to maintain accessibility
	// by allowing the listener to also be fired for
	// appropriate keyboard events
	rng.addEventListener("keydown", listener);
}
	