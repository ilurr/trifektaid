let elem = gc('.js-datepicker', document);
let now = new Date();
let twnty = now.setFullYear(now.getFullYear() - 20);

let options = {
	maxDate: new Date(),
	format: "dd MM yyyy",
	leftArrow: '<',
	language: 'id',
	rightArrow: '>',
	//endDate: '+dd',
	// disableTouchKeyboard: true,
	container: '#js-datepicker-container',
	orientation: "bottom auto",
	// todayHighlight: true,
	defaultViewDate: twnty,
	// beforeShowYear: true,
	startView: 2, 
	autohide: true
}
if(!!elem) {
	const datepicker = new Datepicker(elem, options);
	// elem.addEventListener('changeDate', function() {
	// 	elem.value = datepicker.getDate();
	// });
}
