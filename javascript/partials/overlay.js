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
