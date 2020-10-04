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
