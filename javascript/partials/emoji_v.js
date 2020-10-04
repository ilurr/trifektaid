let emoji = document.getElementById('emoji')
let inside = false

if(!!emoji) {
	console.log(emoji)	
	document.addEventListener('click', function(e){
		let tr = e.target.dataset.toggle;
		if(tr=="emoji") {
			inside = true
			let parent = e.target.closest("."+e.target.dataset.container);
			if(!!parent) {
				let emoji2 = parent.querySelector('[data-emoji]');
				let input = parent.querySelector("."+e.target.dataset.target);
				let rendered = e.target.dataset.render;
				console.log(emoji2)
				if((" " + e.target.className + " ").replace(/[\n\t]/g, " ").indexOf("active") > -1 ) {
					e.target.classList.remove('active');
					if(rendered) {
						emoji2.classList.remove('show');
					} 
				} else {
					e.target.classList.add('active');
					if(!rendered) {
						let k = emoji.querySelector('[data-emoji]').cloneNode(true);
						parent.appendChild(k);
						e.target.setAttribute('data-render',true);
						k.classList.add('show');
						k.addEventListener('click', function(){
							console.log(this)
						});
					} else {
						emoji2.classList.add('show');
					}
				}
			}
		}
	});
}
