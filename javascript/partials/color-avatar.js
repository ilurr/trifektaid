var list = document.getElementsByClassName('profile-avatar');

function stringToHslColor(str) {
	var str = str.toUpperCase();
	var range = 360 / 26; // 26 chars
	var csMax = 30; // range saturation 30 - 95
	var clMin = 80; // range lightness 50 - 80
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i);
		var int = hash - 64;
		if(i>0) {
			h = (h + ((hash<<5) - hash)) % 360;
			s = s + (int*Math.floor(65 / 26));
			l = l - (int*Math.floor(30 / 26));
		} else {
			var h = Math.floor(range*int);
			var s = csMax;
			var l = clMin;
		}
	}
	//console.log(h+","+s+","+l);
	return 'hsl('+(h)+','+(s)+'%, '+(l)+'%)';
}
function applyHSLColor(element, text) {
	element.style.backgroundColor = stringToHslColor(text);
}

//console.log(list);
if(!!list) {
	for(var i=0;i<list.length;i++) {
		//console.log(list[i]);
		var t = list[i].getAttribute('data-init')
		applyHSLColor(list[i], t);
	}
}
