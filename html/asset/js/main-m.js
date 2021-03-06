
////=include '../partials/main-jquery.js'

// slider
let slider = document.querySelectorAll('[data-slider="true"]');
if(!!slider) {
	slider.forEach(function(item){
		let slider = tns({
			container: item,
			navPosition: 'bottom',
			controlsText: ['<span class="icon-arrow icon-arrow-left"></span>','<span class="icon-arrow icon-arrow-right"></span>'],
			autoplay: false,
			loop: false,
			autoHeight: true,
			lazyload: true,
			mouseDrag: true,
		  });
	});
}

// datepicker
////=include '../partials/plugin-datepicker-config.js'

// discover
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


function setCookies(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    // document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/; domain=trifekta.id; SameSite=None; Secure";
    document.cookie = cname + "=" + cvalue + ";" + expires + "; path=/; ";
}
function getCookies(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function checkCookies(cname) {
    var c = getCookies(cname);
    if (c != "") {
        return true
    } else {
        return false
    }
}

let fb = document.querySelector('[data-toggle="filter"]');
if(!!fb) {
	document.addEventListener('click', function(e){
		let ft = e.target.dataset.toggle;
		let ma = document.querySelector('.modal-open');
		let fbx = document.getElementById('discoverFilter');
		// console.log(ma)
		if(!!ma) {
			if(ma.contains(e.target)) {
			} else {
				closeFilter(fbx);
			}
		} else if(!!fbx) {
			if(fbx.contains(e.target)) {
			} else {
				closeFilter(fbx);
			}
		}
		if(!!ft && ft=="filter") {
			if(!!fbx) {
				openFilter(fbx);
			}
		}
	});
}

function openFilter(el) {
	el.classList.add('-show');
}

function closeFilter(el) {
	el.classList.remove('-show');
}
let dp = document.getElementById('discoverFilterPeople');
let dpi = document.getElementById('discoverFilterPeopleItem');

if(!!dp && !!dpi) {
	// console.log(dp)
	dp.addEventListener('click', function(e){
		let status = dp.checked;
		let dpir = dpi.querySelectorAll('[type="radio"]');
		// console.log(status)
		if(status) {
			dpi.classList.remove('-disabled');
			if(!!dpir) {
				dpir.forEach(function(item){
					setRadioActive(item, 1);
				});
			}
		} else {
			dpi.classList.add('-disabled');
			if(!!dpir) {
				dpir.forEach(function(item){
					setRadioActive(item, 0);
				});
			}
		}
	});
}

function setRadioActive(el, status) {
	if(!!el) {
		if(status==1) {
			el.removeAttribute('disabled');
		} else {
			el.setAttribute('disabled','disabled');
		}
	}
}
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
	
// clear input location
let clr = document.getElementById('discoverLocationClear');
let locSearch = document.getElementById('discoverLocationSearch');
let locList = document.getElementById('discoverLocationList');
if(!!clr && !!locSearch && !!locList) {
	clr.addEventListener('click', function(e){
		locSearch.value = '';
		locList.innerHTML = '';
		locSearch.focus();
	});
}

// button location search
let targ = document.getElementById('discoverLocationResult');
let targ_inp = document.getElementById('discoverLocationResultInput');
document.addEventListener('click', function(e){
	let loc = e.target.dataset.loc;
	if(loc=='send') {
		let v = e.target.value;
		if(!!targ && !!targ_inp) {
			targ_inp.value = v;
			targ.innerHTML = v;
		}
	}
});


// rating
let rating = document.querySelectorAll('[data-rating]');
// console.log(rating.length);

if(!!rating && rating.length>0) {
	rating.forEach(function(item, index){
		setRating(item);
	});
}

function setRating(el) {
	let val = parseFloat(el.getAttribute('data-rating'));
	if(!!val) {
		return el.setAttribute('style','width:'+((val/5)*100)+'%');
	}
}


// overlay
function openOverlay(el) {
	if(!!el) {
		el.classList.add('-show');
	}
}
function closeOverlay(el) {
	if(!!el) {
		el.classList.remove('-show');
	}
}
document.addEventListener('click', function(e){
	let ol = e.target.dataset.overlay;
	if(ol=="true") {
		// console.log('klik')
		closeOverlay(e.target);
	}
});


// search
let sr = document.querySelector('[data-toggle="search"]');
let sb = document.getElementById('searchBar');
if(!!sr) {
	sr.addEventListener('click', function(e){
		if(!!sb) {
			if((" " + this.className + " ").replace(/[\n\t]/g, " ").indexOf("-active") > -1 ) {
				// document.focus()
			} else {
				this.classList.add('-active');
				sb.classList.add('-show');
				sb.querySelector('form').firstElementChild.focus();
			}
		}
	});
}
document.addEventListener('click', function(e){
	if(!!sb && !!sr) {
		if(sb.contains(e.target) || sr.contains(e.target)) {
		} else {
			sb.classList.remove('-show');
			sr.classList.remove('-active');
		}
	}
});


// form
function triggerEvent(el, eventName) {
	let event = document.createEvent('HTMLEvents')
	event.initEvent(eventName, true, false)
	el.dispatchEvent(event)
}
  
let p = gca('.form-select');
if(!!p) {
	p.forEach(function(item, index){
		let select = item.querySelector('select');
		// console.log(select)
		select.addEventListener('change', function(e) {
			if(e.target.value == 0) {
				item.classList.add('init');
			} else {
				item.classList.remove('init');
			}
			//e.target.classList[e.target.value == 0 ? 'add' : 'remove']('empty')
		})
		triggerEvent(select, 'change')
	});
}


// auto height post 
const tx = document.getElementById('post-content');
if(!!tx) {
	tx.setAttribute('style', 'height:' + (tx.scrollHeight) + 'px;overflow-y:hidden;');
	tx.addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
}


//datepicker
$('.js-datepicker').datepicker({
	// format: 'yyyy/mm/dd',
	format: 'dd M yyyy',
	container: '#js-datepicker-container',
	autoclose: true,
	zIndexOffset: 8,
	endDate: '0d'
});    
