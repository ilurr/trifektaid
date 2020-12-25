
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

// swipe discover
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


// emoji picker
let emoji = document.getElementById('emoji')
let inside = false
let input;

if(!!emoji) {
	// console.log(emoji)	
	document.addEventListener('click', function(e){
		let dataToggle = e.target.dataset.toggle;
		let roots = document.querySelectorAll('.emoji.show')[0]
		let rootsem = document.querySelectorAll('[data-toggle="emoji"].active')[0]
		// console.log(roots)
		// console.log(rootsem)
		if(!!roots || !!rootsem) {
			// console.log('ada yg aktif nih')
			if(roots.contains(e.target) || rootsem.contains(e.target)) {
			} else {
				roots.classList.remove('show')
				rootsem.classList.remove('active')
			// 	// rootsem.forEach(function(item){
			// 	// 		item.classList.remove('active')
			// 	// 		console.log('outside')
			// 	// });
			}
		}
		// console.log(rootsem)
		// roots.forEach(function(item){
		// 	if(item.contains(e.target)) {
		// 		console.log('inside')
		// 	} else {
		// 		item.classList.remove('show')
		// 		console.log('outside')
		// 	}
		// });
		if(dataToggle=="emoji") {
			let parent = e.target.closest("."+e.target.dataset.container);
			if(!!parent) {
				let emoji2 = parent.querySelector('[data-emoji]');
				input = parent.querySelector("."+e.target.dataset.target);
				let rendered = e.target.dataset.render;
				// console.log(emoji2)
				// console.log(e.target.className)
				//if((" " + e.target.className + " ").replace(/[\n\t]/g, " ").indexOf("active") > -1 ) {
				//	console.log('ada cy')
				//	e.target.classList.remove('active');
				//	emoji2.classList.remove('show');
				//} else {
					e.target.classList.add('active');
					if(!rendered) {
						let k = emoji.querySelector('[data-emoji]').cloneNode(true);
						parent.appendChild(k);
						e.target.setAttribute('data-render',true);
						k.classList.add('show');
					} else {
						emoji2.classList.add('show');
					}
				//}

				// bisa kah
				// let btn = parent.querySelector()
			}
		// } else {

		}
		if(dataToggle=="emojiTab") {
			let parentTab = e.target.closest('[data-emoji]');
			// console.log(e.target)
			// e.target.classList.
			if(!!parentTab) {
				let btn = parentTab.querySelectorAll('[data-toggle=emojiTab]')
				let pnl = parentTab.querySelectorAll('[data-emoji-id]')
				let trg = e.target.getAttribute('data-target');
				// console.log(btn)
				// console.log(trg)
				btn.forEach(function(item){
					// console.log(item)					
					item.classList.remove('active')
				});
				e.target.classList.add('active');

				pnl.forEach(function(item){
					// console.log(item.getAttribute('data-emoji-id'))
					
					item.classList.remove('active')
					if(item.getAttribute('data-emoji-id') == trg) {
					// if(item.contains('[data-emeji-id="'+trg+'"')) {
						// console.log('lo')
						item.classList.add('active');
					}
				});
				// parentTab.classList.add('active');
			}
		}
		if(dataToggle=="emojiIcon") {
			// console.log(e.target.innerHTML)
			if(!!input) {
				insertAtCaret(input, e.target.innerHTML)
			}
		}
	});
}

function insertAtCaret(txtarea, text) {
	// var txtarea = document.getElementById(areaId);
	if (!txtarea) {
		return;
	}

	var scrollPos = txtarea.scrollTop;
	var strPos = 0;
	var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
		"ff" : (document.selection ? "ie" : false));
	if (br == "ie") {
		txtarea.focus();
		var range = document.selection.createRange();
		range.moveStart('character', -txtarea.value.length);
		strPos = range.text.length;
	} else if (br == "ff") {
		strPos = txtarea.selectionStart;
	}

	var front = (txtarea.value).substring(0, strPos);
	var back = (txtarea.value).substring(strPos, txtarea.value.length);
	txtarea.value = front + text + back;
	strPos = strPos + text.length;
	if (br == "ie") {
		txtarea.focus();
		var ieRange = document.selection.createRange();
		ieRange.moveStart('character', -txtarea.value.length);
		ieRange.moveStart('character', strPos);
		ieRange.moveEnd('character', 0);
		ieRange.select();
	} else if (br == "ff") {
		txtarea.selectionStart = strPos;
		txtarea.selectionEnd = strPos;
		txtarea.focus();
	}

	txtarea.scrollTop = scrollPos;
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
