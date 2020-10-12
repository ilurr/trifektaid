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