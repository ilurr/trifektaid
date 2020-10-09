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
