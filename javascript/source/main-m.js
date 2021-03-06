
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
////=include '../partials/plugin-datepicker-config.js'

// discover
//=include '../partials/discover-swipe.js'
//=include '../partials/cookies.js'
//=include '../partials/discover-filter.js'
//=include '../partials/discover-people.js'
//=include '../partials/discover-range.js'
//=include '../partials/discover-location.js'

// rating
//=include '../partials/rating.js'

// overlay
//=include '../partials/overlay.js'

// search
//=include '../partials/search.js'

// form
//=include '../partials/form-manipulate.js'

// auto height post 
//=include '../partials/autoheight-input.js'

//datepicker
$('.js-datepicker').datepicker({
	// format: 'yyyy/mm/dd',
	format: 'dd M yyyy',
	container: '#js-datepicker-container',
	autoclose: true,
	zIndexOffset: 8,
	endDate: '0d'
});    
