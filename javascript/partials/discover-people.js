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