
////=include '../partials/main-jquery.js'

// slider
let slider = document.querySelectorAll('[data-slider="true"]');
if(!!slider) {
	slider.forEach(function(item){
		let slider = tns({
			container: item,
			navPosition: 'bottom',
			controlsText: ['<span class="icon-arrow icon-arrow-left"></span>','<span class="icon-arrow icon-arrow-right"></span>'],
			autoplay: false,
			loop: false,
			autoHeight: true,
			lazyload: true,
			mouseDrag: true,
		  });
	});
}

// datepicker
//=include '../partials/plugin-datepicker-config.js'

// swipe discover
//=include '../partials/swipe-discover.js'

// rating
//=include '../partials/rating.js'

// form
//=include '../partials/form-manipulate.js'

// auto height post 
//=include '../partials/autoheight-input.js'

// emoji picker
//=include '../partials/emoji.js'
