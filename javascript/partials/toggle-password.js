let tp = gc(".js-view", document);
let vt = gc(".js-viewTxt", document);
if(!!tp && !!vt) {
	tp.addEventListener("click", function(e){
		e.preventDefault();
		togglePsswrd(vt, this);
	});
}
function togglePsswrd(x, y) {
	// console.log(y);
	if (x.type === "password") {
		x.type = "text";
		y.classList.add('-active');
	} else {
		x.type = "password";
		y.classList.remove('-active');
	}
}
