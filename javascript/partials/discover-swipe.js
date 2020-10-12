/* swipe script modified from https://codepen.io/RobVermeer/pen/japZpY, credit to Rob Vermeer */
// swipe

function initSwipe() {
	let swipe = document.querySelectorAll('[data-swipe]');
	if(!!swipe) {
		// console.log(swipe.length);
		swipe.forEach(function(item, index){
			// console.log(item);
			getSwipe(item);
		});
	}
}

function initGuide() {
	let gd = document.getElementById('discoverGuide');
	let gdcl = document.getElementById('discoverGuideClose');
	let cuk = checkCookies('__gd_ds');
	if(!!gd) {
		if(!cuk) {
			gd.classList.remove('-hide');
		}
		if(!!gdcl) {
			gdcl.addEventListener('click', function(e){
				closeGuide();
			});
		}
	}
}

function closeGuide() {
	let dg = document.getElementById('discoverGuide');
	if(!!dg) {
		setCookies('__gd_ds', 1, 365);
		dg.classList.add('-hide');
	}
}

function getSwipe(el) {
	let mc = new Hammer(el);
	// mc.get('swipe').set({
	// 	direction: Hammer.DIRECTION_ALL,
	// 	threshold: 5 
	// });
	mc.on('pan', function (ev) {
		el.classList.add('moving');
	  });
	mc.on('pan', function (ev) {
		if (ev.deltaX === 0) return;
		if (ev.center.x === 0 && ev.center.y === 0) return;
	
		// tinderContainer.classList.toggle('tinder_love', ev.deltaX > 0);
		// tinderContainer.classList.toggle('tinder_nope', ev.deltaX < 0);
	
		var xMulti = ev.deltaX * 0.03;
		var yMulti = ev.deltaY / 80;
		var rotate = xMulti * yMulti;
		// console.log(ev.deltaX)
		// console.log(ev.deltaY)
	
		ev.target.style.transform = 'translate(' + ev.deltaX + 'px, ' + ev.deltaY + 'px) rotate(' + rotate + 'deg)';

	  });

	mc.on('panend', function (ev) {
		el.classList.remove('moving');
		// tinderContainer.classList.remove('tinder_love');
		// tinderContainer.classList.remove('tinder_nope');

			// close guide if user start to pan
			closeGuide();

		var moveOutWidth = document.getElementById('discoverCard').clientWidth;
		var keep = Math.abs(ev.deltaX) < 125;
		// var keep = Math.abs(ev.deltaX) < 80 || Math.abs(ev.velocityX) < 0.5;
		//console.log(keep)
	
		ev.target.classList.toggle('hide', !keep);
	
		if (keep) {
		  ev.target.style.transform = '';
		} else {
		  var endX = Math.max(Math.abs(ev.velocityX) * moveOutWidth, moveOutWidth);
		  var toX = ev.deltaX > 0 ? endX : -endX;
		  var endY = Math.abs(ev.velocityY) * moveOutWidth;
		  var toY = ev.deltaY > 0 ? endY : -endY;
		  var xMulti = ev.deltaX * 0.03;
		  var yMulti = ev.deltaY / 80;
		  var rotate = xMulti * yMulti;
	
		  ev.target.style.transform = 'translate(' + toX + 'px, ' + (toY + ev.deltaY) + 'px) rotate(' + rotate + 'deg)';
		  //initCards();
		}
	  });
	
	
	// mc.on("swipeleft swiperight", function(ev) {
	// 	let dir = ev.type;
	// 	console.log(dir);
	// 	rotateSwipe(dir, el);
	// });
}

function rotateSwipe(dir, el) {
	el.classList.add('discover-'+dir);
}

