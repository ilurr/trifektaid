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
