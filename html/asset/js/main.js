
//// main 
function triggerEvent(el, eventName) {
	let event = document.createEvent('HTMLEvents')
	event.initEvent(eventName, true, false)
	el.dispatchEvent(event)
}
  
let p = gca('.form-select');
if(!!p) {
	p.forEach(function(item, index){
		let select = item.querySelector('select');
		// console.log(select)
		select.addEventListener('change', function(e) {
			if(e.target.value == 0) {
				item.classList.add('init');
			} else {
				item.classList.remove('init');
			}
			//e.target.classList[e.target.value == 0 ? 'add' : 'remove']('empty')
		})
		triggerEvent(select, 'change')
	});
}

let rating = document.querySelectorAll('[data-rating]');
// console.log(rating.length);

if(!!rating && rating.length>0) {
	rating.forEach(function(item, index){
		setRating(item);
	});
}

function setRating(el) {
	let val = parseFloat(el.getAttribute('data-rating'));
	if(!!val) {
		return el.setAttribute('style','width:'+((val/5)*100)+'%');
	}
}

// swipe
function initSwipe() {
	let swipe = document.querySelectorAll('[data-swipe]');
	if(!!swipe) {
		console.log(swipe.length);
		swipe.forEach(function(item, index){
			console.log(item);
			getSwipe(item);
		});
	}
}

function getSwipe(el) {
	let mc = new Hammer(el);
	mc.get('swipe').set({
		direction: Hammer.DIRECTION_ALL,
		threshold: 5 
	});
	mc.on("swipeleft swiperight", function(ev) {
		let dir = ev.type;
		console.log(dir);
		rotateSwipe(dir, el);
	});
}

function rotateSwipe(dir, el) {
	el.classList.add('discover-'+dir);
}



//// global 

function ce(el) {
	return document.createElement(el);
}

function gi(el) {
	return document.getElementById(el);
}

function gc(el, d) {
	return d.querySelectorAll(el)[0];
}

function gca(el) {
	return document.querySelectorAll(el);
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


//// plugin 
var Datepicker = (function () {
  'use strict';

  function hasProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  function lastItemOf(arr) {
    return arr[arr.length - 1];
  }

  // push only the items not included in the array
  function pushUnique(arr, ...items) {
    items.forEach((item) => {
      if (arr.includes(item)) {
        return;
      }
      arr.push(item);
    });
    return arr;
  }

  function stringToArray(str, separator) {
    // convert empty string to an empty array
    return str ? str.split(separator) : [];
  }

  function isInRange(testVal, min, max) {
    const minOK = min === undefined || testVal >= min;
    const maxOK = max === undefined || testVal <= max;
    return minOK && maxOK;
  }

  function limitToRange(val, min, max) {
    if (val < min) {
      return min;
    }
    if (val > max) {
      return max;
    }
    return val;
  }

  function createTagRepeat(tagName, repeat, attributes = {}, index = 0, html = '') {
    const openTagSrc = Object.keys(attributes).reduce((src, attr) => {
      let val = attributes[attr];
      if (typeof val === 'function') {
        val = val(index);
      }
      return `${src} ${attr}="${val}"`;
    }, tagName);
    html += `<${openTagSrc}></${tagName}>`;

    const next = index + 1;
    return next < repeat
      ? createTagRepeat(tagName, repeat, attributes, next, html)
      : html;
  }

  // Remove the spacing surrounding tags for HTML parser not to create text nodes
  // before/after elements
  function optimizeTemplateHTML(html) {
    return html.replace(/>\s+/g, '>').replace(/\s+</, '<');
  }

  function stripTime(timeValue) {
    return new Date(timeValue).setHours(0, 0, 0, 0);
  }

  function today() {
    return new Date().setHours(0, 0, 0, 0);
  }

  // Get the time value of the start of given date or year, month and day
  function dateValue(...args) {
    switch (args.length) {
      case 0:
        return today();
      case 1:
        return stripTime(args[0]);
    }

    // use setFullYear() to keep 2-digit year from being mapped to 1900-1999
    const newDate = new Date(0);
    newDate.setFullYear(...args);
    return newDate.setHours(0, 0, 0, 0);
  }

  function addDays(date, amount) {
    const newDate = new Date(date);
    return newDate.setDate(newDate.getDate() + amount);
  }

  function addWeeks(date, amount) {
    return addDays(date, amount * 7);
  }

  function addMonths(date, amount) {
    // If the day of the date is not in the new month, the last day of the new
    // month will be returned. e.g. Jan 31 + 1 month → Feb 28 (not Mar 03)
    const newDate = new Date(date);
    const monthsToSet = newDate.getMonth() + amount;
    let expectedMonth = monthsToSet % 12;
    if (expectedMonth < 0) {
      expectedMonth += 12;
    }

    const time = newDate.setMonth(monthsToSet);
    return newDate.getMonth() !== expectedMonth ? newDate.setDate(0) : time;
  }

  function addYears(date, amount) {
    // If the date is Feb 29 and the new year is not a leap year, Feb 28 of the
    // new year will be returned.
    const newDate = new Date(date);
    const expectedMonth = newDate.getMonth();
    const time = newDate.setFullYear(newDate.getFullYear() + amount);
    return expectedMonth === 1 && newDate.getMonth() === 2 ? newDate.setDate(0) : time;
  }

  // Calculate the distance bettwen 2 days of the week
  function dayDiff(day, from) {
    return (day - from + 7) % 7;
  }

  // Get the date of the specified day of the week of given base date
  function dayOfTheWeekOf(baseDate, dayOfWeek, weekStart = 0) {
    const baseDay = new Date(baseDate).getDay();
    return addDays(baseDate, dayDiff(dayOfWeek, weekStart) - dayDiff(baseDay, weekStart));
  }

  // Get the ISO week of a date
  function getWeek(date) {
    // start of ISO week is Monday
    const thuOfTheWeek = dayOfTheWeekOf(date, 4, 1);
    // 1st week == the week where the 4th of January is in
    const firstThu = dayOfTheWeekOf(new Date(thuOfTheWeek).setMonth(0, 4), 4, 1);
    return Math.round((thuOfTheWeek - firstThu) / 604800000) + 1;
  }

  // Get the start year of the period of years that includes given date
  // years: length of the year period
  function startOfYearPeriod(date, years) {
    /* @see https://en.wikipedia.org/wiki/Year_zero#ISO_8601 */
    const year = new Date(date).getFullYear();
    return Math.floor(year / years) * years;
  }

  // pattern for format parts
  const reFormatTokens = /dd?|DD?|mm?|MM?|yy?(?:yy)?/;
  // pattern for non date parts
  const reNonDateParts = /[\s!-/:-@[-`{-~年月日]+/;
  // cache for persed formats
  let knownFormats = {};
  // parse funtions for date parts
  const parseFns = {
    y(date, year) {
      return new Date(date).setFullYear(parseInt(year, 10));
    },
    M: undefined,  // placeholder to maintain the key order
    m(date, month, locale) {
      const newDate = new Date(date);
      let monthIndex = parseInt(month, 10) - 1;

      if (isNaN(monthIndex)) {
        if (!month) {
          return NaN;
        }

        const monthName = month.toLowerCase();
        const compareNames = name => name.toLowerCase().startsWith(monthName);
        // compare with both short and full names because some locales have periods
        // in the short names (not equal to the first X letters of the full names)
        monthIndex = locale.monthsShort.findIndex(compareNames);
        if (monthIndex < 0) {
          monthIndex = locale.months.findIndex(compareNames);
        }
        return monthIndex < 0 ? NaN : newDate.setMonth(monthIndex);
      }

      newDate.setMonth(monthIndex);
      return newDate.getMonth() !== normalizeMonth(monthIndex)
        ? newDate.setDate(0)
        : newDate.getTime();
    },
    d(date, day) {
      return new Date(date).setDate(parseInt(day, 10));
    },
  };
  parseFns.M = parseFns.m;  // make "M" an alias of "m"
  // format functions for date parts
  const formatFns = {
    d(date) {
      return date.getDate();
    },
    dd(date) {
      return padZero(date.getDate(), 2);
    },
    D(date, locale) {
      return locale.daysShort[date.getDay()];
    },
    DD(date, locale) {
      return locale.days[date.getDay()];
    },
    m(date) {
      return date.getMonth() + 1;
    },
    mm(date) {
      return padZero(date.getMonth() + 1, 2);
    },
    M(date, locale) {
      return locale.monthsShort[date.getMonth()];
    },
    MM(date, locale) {
      return locale.months[date.getMonth()];
    },
    y(date) {
      return date.getFullYear();
    },
    yy(date) {
      return padZero(date.getFullYear(), 2).slice(-2);
    },
    yyyy(date) {
      return padZero(date.getFullYear(), 4);
    },
  };

  // get month index in normal range (0 - 11) from any number
  function normalizeMonth(monthIndex) {
    return monthIndex > -1 ? monthIndex % 12 : normalizeMonth(monthIndex + 12);
  }

  function padZero(num, length) {
    return num.toString().padStart(length, '0');
  }

  function parseFormatString(format) {
    if (typeof format !== 'string') {
      throw new Error("Invalid date format.");
    }
    if (format in knownFormats) {
      return knownFormats[format];
    }

    // sprit the format string into parts and seprators
    const separators = format.split(reFormatTokens);
    const parts = format.match(new RegExp(reFormatTokens, 'g'));
    if (separators.length === 0 || !parts) {
      throw new Error("Invalid date format.");
    }

    // collect format functions used in the format
    const partFormatters = parts.map(token => formatFns[token]);

    // collect parse functions used in the format
    // iterate over parseFns' keys in order to keep the order of the keys.
    const partParsers = Object.keys(parseFns).reduce((parsers, key) => {
      const token = parts.find(part => part[0] === key);
      if (!token) {
        return parsers;
      }
      parsers[key] = parseFns[key];
      return parsers;
    }, {});
    const partParserKeys = Object.keys(partParsers);

    return knownFormats[format] = {
      parser(dateStr, locale) {
        const dateParts = dateStr.split(reNonDateParts).reduce((dtParts, part, index) => {
          if (part.length > 0 && parts[index]) {
            const token = parts[index][0];
            if (parseFns[token] !== undefined) {
              dtParts[token] = part;
            }
          }
          return dtParts;
        }, {});

        // iterate over partParsers' keys so that the parsing is made in the oder
        // of year, month and day to prevent the day parser from correcting last
        // day of month wrongly
        return partParserKeys.reduce((origDate, key) => {
          const newDate = partParsers[key](origDate, dateParts[key], locale);
          // ingnore the part failed to parse
          return isNaN(newDate) ? origDate : newDate;
        }, today());
      },
      formatter(date, locale) {
        let dateStr = partFormatters.reduce((str, fn, index) => {
          return str += `${separators[index]}${fn(date, locale)}`;
        }, '');
        // separators' length is always parts' length + 1,
        return dateStr += lastItemOf(separators);
      },
    };
  }

  function parseDate(dateStr, format, locale) {
    if (dateStr instanceof Date || typeof dateStr === 'number') {
      const date = stripTime(dateStr);
      return isNaN(date) ? undefined : date;
    }
    if (!dateStr) {
      return undefined;
    }
    if (dateStr === 'today') {
      return today();
    }

    if (format && format.toValue) {
      const date = format.toValue(dateStr, format, locale);
      return isNaN(date) ? undefined : stripTime(date);
    }

    return parseFormatString(format).parser(dateStr, locale);
  }

  function formatDate(date, format, locale) {
    if (isNaN(date) || (!date && date !== 0)) {
      return '';
    }

    const dateObj = typeof date === 'number' ? new Date(date) : date;

    if (format.toDisplay) {
      return format.toDisplay(dateObj, format, locale);
    }

    return parseFormatString(format).formatter(dateObj, locale);
  }

  const listenerRegistry = new WeakMap();
  const {addEventListener, removeEventListener} = EventTarget.prototype;

  // Register event listeners to a key object
  // listeners: array of listener definitions;
  //   - each definition must be a flat array of event target and the arguments
  //     used to call addEventListener() on the target
  function registerListeners(keyObj, listeners) {
    let registered = listenerRegistry.get(keyObj);
    if (!registered) {
      registered = [];
      listenerRegistry.set(keyObj, registered);
    }
    listeners.forEach((listener) => {
      addEventListener.call(...listener);
      registered.push(listener);
    });
  }

  function unregisterListeners(keyObj) {
    let listeners = listenerRegistry.get(keyObj);
    if (!listeners) {
      return;
    }
    listeners.forEach((listener) => {
      removeEventListener.call(...listener);
    });
    listenerRegistry.delete(keyObj);
  }

  // Event.composedPath() polyfill for Edge
  // based on https://gist.github.com/kleinfreund/e9787d73776c0e3750dcfcdc89f100ec
  if (!Event.prototype.composedPath) {
    const getComposedPath = (node, path = []) => {
      path.push(node);

      let parent;
      if (node.parentNode) {
        parent = node.parentNode;
      } else if (node.host) { // ShadowRoot
        parent = node.host;
      } else if (node.defaultView) {  // Document
        parent = node.defaultView;
      }
      return parent ? getComposedPath(parent, path) : path;
    };

    Event.prototype.composedPath = function () {
      return getComposedPath(this.target);
    };
  }

  function findFromPath(path, criteria, currentTarget, index = 0) {
    const el = path[index];
    if (criteria(el)) {
      return el;
    } else if (el === currentTarget || !el.parentElement) {
      // stop when reaching currentTarget or <html>
      return;
    }
    return findFromPath(path, criteria, currentTarget, index + 1);
  }

  // Search for the actual target of a delegated event
  function findElementInEventPath(ev, selector) {
    const criteria = typeof selector === 'function' ? selector : el => el.matches(selector);
    return findFromPath(ev.composedPath(), criteria, ev.currentTarget);
  }

  // default locales
  const locales = {
    en: {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      today: "Today",
      clear: "Clear",
      titleFormat: "MM y"
    }
  };

  // config options updatable by setOptions() and their default values
  const defaultOptions = {
    autohide: false,
    beforeShowDay: null,
    beforeShowDecade: null,
    beforeShowMonth: null,
    beforeShowYear: null,
    calendarWeeks: false,
    clearBtn: false,
    dateDelimiter: ',',
    datesDisabled: [],
    daysOfWeekDisabled: [],
    daysOfWeekHighlighted: [],
    defaultViewDate: undefined, // placeholder, defaults to today() by the program
    disableTouchKeyboard: false,
    format: 'mm/dd/yyyy',
    language: 'en',
    maxDate: null,
    maxNumberOfDates: 1,
    maxView: 3,
    minDate: null,
    nextArrow: '»',
    orientation: 'auto',
    prevArrow: '«',
    showDaysOfWeek: true,
    showOnFocus: true,
    startView: 0,
    title: '',
    todayBtn: false,
    todayBtnMode: 0,
    todayHighlight: false,
    weekStart: 0,
  };

  const range = document.createRange();

  function parseHTML(html) {
    return range.createContextualFragment(html);
  }

  function hideElement(el) {
    if (el.style.display === 'none') {
      return;
    }
    // back up the existing display setting in data-style-display
    if (el.style.display) {
      el.dataset.styleDisplay = el.style.display;
    }
    el.style.display = 'none';
  }

  function showElement(el) {
    if (el.style.display !== 'none') {
      return;
    }
    if (el.dataset.styleDisplay) {
      // restore backed-up dispay property
      el.style.display = el.dataset.styleDisplay;
      delete el.dataset.styleDisplay;
    } else {
      el.style.display = '';
    }
  }

  function emptyChildNodes(el) {
    if (el.firstChild) {
      el.removeChild(el.firstChild);
      emptyChildNodes(el);
    }
  }

  function replaceChildNodes(el, newChildNodes) {
    emptyChildNodes(el);
    if (newChildNodes instanceof DocumentFragment) {
      el.appendChild(newChildNodes);
    } else if (typeof newChildNodes === 'string') {
      el.appendChild(parseHTML(newChildNodes));
    } else if (typeof newChildNodes.forEach === 'function') {
      newChildNodes.forEach((node) => {
        el.appendChild(node);
      });
    }
  }

  const {
    language: defaultLang,
    format: defaultFormat,
    weekStart: defaultWeekStart,
  } = defaultOptions;

  // Reducer function to filter out invalid day-of-week from the input
  function sanitizeDOW(dow, day) {
    return dow.length < 6 && day >= 0 && day < 7
      ? pushUnique(dow, day)
      : dow;
  }

  function calcEndOfWeek(startOfWeek) {
    return (startOfWeek + 6) % 7;
  }

  // validate input date. if invalid, fallback to the original value
  function validateDate(value, format, locale, origValue) {
    const date = parseDate(value, format, locale);
    return date !== undefined ? date : origValue;
  }

  // Validate viewId. if invalid, fallback to the original value
  function validateViewId(value, origValue) {
    const viewId = parseInt(value, 10);
    return viewId >= 0 && viewId < 4 ? viewId : origValue;
  }

  // Create Datepicker configuration to set
  function processOptions(options, datepicker) {
    const inOpts = Object.assign({}, options);
    const config = {};
    const locales = datepicker.constructor.locales;
    let {
      format,
      language,
      locale,
      maxDate,
      maxView,
      minDate,
      startView,
      weekStart,
    } = datepicker.config || {};

    if (inOpts.language) {
      let lang;
      if (inOpts.language !== language) {
        if (locales[inOpts.language]) {
          lang = inOpts.language;
        } else {
          // Check if langauge + region tag can fallback to the one without
          // region (e.g. fr-CA → fr)
          lang = inOpts.language.split('-')[0];
          if (locales[lang] === undefined) {
            lang = false;
          }
        }
      }
      delete inOpts.language;
      if (lang) {
        language = config.language = lang;

        // update locale as well when updating language
        const origLocale = locale || locales[defaultLang];
        // use default language's properties for the fallback
        locale = Object.assign({
          format: defaultFormat,
          weekStart: defaultWeekStart
        }, locales[defaultLang]);
        if (language !== defaultLang) {
          Object.assign(locale, locales[language]);
        }
        config.locale = locale;
        // if format and/or weekStart are the same as old locale's defaults,
        // update them to new locale's defaults
        if (format === origLocale.format) {
          format = config.format = locale.format;
        }
        if (weekStart === origLocale.weekStart) {
          weekStart = config.weekStart = locale.weekStart;
          config.weekEnd = calcEndOfWeek(locale.weekStart);
        }
      }
    }

    if (inOpts.format) {
      const hasToDisplay = typeof inOpts.format.toDisplay === 'function';
      const hasToValue = typeof inOpts.format.toValue === 'function';
      const validFormatString = reFormatTokens.test(inOpts.format);
      if ((hasToDisplay && hasToValue) || validFormatString) {
        format = config.format = inOpts.format;
      }
      delete inOpts.format;
    }

    //*** dates ***//
    // while min and maxDate for "no limit" in the options are better to be null
    // (especially when updating), the ones in the config have to be undefined
    // because null is treated as 0 (= unix epoch) when comparing with time value
    let minDt = minDate;
    let maxDt = maxDate;
    if (inOpts.minDate !== undefined) {
      minDt = inOpts.minDate === null
        ? dateValue(0, 0, 1)  // set 0000-01-01 to prevent negative values for year
        : validateDate(inOpts.minDate, format, locale, minDt);
      delete inOpts.minDate;
    }
    if (inOpts.maxDate !== undefined) {
      maxDt = inOpts.maxDate === null
        ? undefined
        : validateDate(inOpts.maxDate, format, locale, maxDt);
      delete inOpts.maxDate;
    }
    if (maxDt < minDt) {
      minDate = config.minDate = maxDt;
      maxDate = config.maxDate = minDt;
    } else {
      if (minDate !== minDt) {
        minDate = config.minDate = minDt;
      }
      if (maxDate !== maxDt) {
        maxDate = config.maxDate = maxDt;
      }
    }

    if (inOpts.datesDisabled) {
      config.datesDisabled = inOpts.datesDisabled.reduce((dates, dt) => {
        const date = parseDate(dt, format, locale);
        return date !== undefined ? pushUnique(dates, date) : dates;
      }, []);
      delete inOpts.datesDisabled;
    }
    if (inOpts.defaultViewDate !== undefined) {
      const viewDate = parseDate(inOpts.defaultViewDate, format, locale);
      if (viewDate !== undefined) {
        config.defaultViewDate = viewDate;
      }
      delete inOpts.defaultViewDate;
    }

    //*** days of week ***//
    if (inOpts.weekStart !== undefined) {
      const wkStart = Number(inOpts.weekStart) % 7;
      if (!isNaN(wkStart)) {
        weekStart = config.weekStart = wkStart;
        config.weekEnd = calcEndOfWeek(wkStart);
      }
      delete inOpts.weekStart;
    }
    if (inOpts.daysOfWeekDisabled) {
      config.daysOfWeekDisabled = inOpts.daysOfWeekDisabled.reduce(sanitizeDOW, []);
      delete inOpts.daysOfWeekDisabled;
    }
    if (inOpts.daysOfWeekHighlighted) {
      config.daysOfWeekHighlighted = inOpts.daysOfWeekHighlighted.reduce(sanitizeDOW, []);
      delete inOpts.daysOfWeekHighlighted;
    }

    //*** multi date ***//
    if (inOpts.maxNumberOfDates !== undefined) {
      const maxNumberOfDates = parseInt(inOpts.maxNumberOfDates, 10);
      if (maxNumberOfDates >= 0) {
        config.maxNumberOfDates = maxNumberOfDates;
        config.multidate = maxNumberOfDates !== 1;
      }
      delete inOpts.maxNumberOfDates;
    }
    if (inOpts.dateDelimiter) {
      config.dateDelimiter = String(inOpts.dateDelimiter);
      delete inOpts.dateDelimiter;
    }

    //*** view mode ***//
    let newMaxView = maxView;
    if (inOpts.maxView !== undefined) {
      newMaxView = validateViewId(inOpts.maxView, maxView);
      delete inOpts.maxView;
    }
    if (newMaxView !== maxView) {
      maxView = config.maxView = newMaxView;
    }

    let newStartView = startView;
    if (inOpts.startView !== undefined) {
      newStartView = validateViewId(inOpts.startView, newStartView);
      delete inOpts.startView;
    }
    // ensure start view < max
    newStartView = maxView < newStartView ? maxView : newStartView;
    if (newStartView !== startView) {
      config.startView = newStartView;
    }

    //*** template ***//
    if (inOpts.prevArrow) {
      const prevArrow = parseHTML(inOpts.prevArrow);
      if (prevArrow.childNodes.length > 0) {
        config.prevArrow = prevArrow.childNodes;
      }
      delete inOpts.prevArrow;
    }
    if (inOpts.nextArrow) {
      const nextArrow = parseHTML(inOpts.nextArrow);
      if (nextArrow.childNodes.length > 0) {
        config.nextArrow = nextArrow.childNodes;
      }
      delete inOpts.nextArrow;
    }

    //*** misc ***//
    if (inOpts.disableTouchKeyboard !== undefined) {
      config.disableTouchKeyboard = 'ontouchstart' in document && !!inOpts.disableTouchKeyboard;
      delete inOpts.disableTouchKeyboard;
    }
    if (inOpts.orientation) {
      const orientation = inOpts.orientation.toLowerCase().split(/\s+/g);
      config.orientation = {
        x: orientation.find(x => (x === 'left' || x === 'right')) || 'auto',
        y: orientation.find(y => (y === 'top' || y === 'bottom')) || 'auto',
      };
      delete inOpts.orientation;
    }
    if (inOpts.todayBtnMode !== undefined) {
      switch(inOpts.todayBtnMode) {
        case 0:
        case 1:
          config.todayBtnMode = inOpts.todayBtnMode;
      }
      delete inOpts.todayBtnMode;
    }

    //*** copy the rest ***//
    Object.keys(inOpts).forEach((key) => {
      if (inOpts[key] !== undefined && hasProperty(defaultOptions, key)) {
        config[key] = inOpts[key];
      }
    });

    return config;
  }

  const pickerTemplate = optimizeTemplateHTML(`<div class="datepicker">
  <div class="datepicker-picker">
    <div class="datepicker-header">
      <div class="datepicker-title"></div>
      <div class="datepicker-controls">
        <button class="%buttonClass% prev-btn"></button>
        <button class="%buttonClass% view-switch"></button>
        <button class="%buttonClass% next-btn"></button>
      </div>
    </div>
    <div class="datepicker-main"></div>
    <div class="datepicker-footer">
      <div class="datepicker-controls">
        <button class="%buttonClass% today-btn"></button>
        <button class="%buttonClass% clear-btn"></button>
      </div>
    </div>
  </div>
</div>`);

  const daysTemplate = optimizeTemplateHTML(`<div class="days">
  <div class="days-of-week">${createTagRepeat('span', 7, {class: 'dow'})}</div>
  <div class="datepicker-grid">${createTagRepeat('span', 42)}</div>
</div>`);

  const calendarWeeksTemplate = optimizeTemplateHTML(`<div class="calendar-weeks">
  <div class="days-of-week"><span class="dow"></span></div>
  <div class="weeks">${createTagRepeat('span', 6, {class: 'week'})}</div>
</div>`);

  // Base class of the view classes
  class View {
    constructor(picker, config) {
      Object.assign(this, config, {
        picker,
        element: parseHTML(`<div class="datepicker-view"></div>`).firstChild,
        selected: [],
      });
      this.init(this.picker.datepicker.config);
    }

    init(options) {
      this.setOptions(options);
      this.updateFocus();
      this.updateSelection();
    }

    // Execute beforeShow() callback and apply the result to the element
    // args:
    // - current - current value on the iteration on view rendering
    // - timeValue - time value of the date to pass to beforeShow()
    performBeforeHook(el, current, timeValue) {
      let result = this.beforeShow(new Date(timeValue));
      switch (typeof result) {
        case 'boolean':
          result = {enabled: result};
          break;
        case 'string':
          result = {classes: result};
      }

      if (result) {
        if (result.enabled === false) {
          el.classList.add('disabled');
          pushUnique(this.disabled, current);
        }
        if (result.classes) {
          const extraClasses = result.classes.split(/\s+/);
          el.classList.add(...extraClasses);
          if (extraClasses.includes('disabled')) {
            pushUnique(this.disabled, current);
          }
        }
        if (result.content) {
          replaceChildNodes(el, result.content);
        }
      }
    }
  }

  class DaysView extends View {
    constructor(picker) {
      super(picker, {
        id: 0,
        name: 'days',
        cellClass: 'day',
      });
    }

    init(options, onConstruction = true) {
      if (onConstruction) {
        const inner = parseHTML(daysTemplate).firstChild;
        this.dow = inner.firstChild;
        this.grid = inner.lastChild;
        this.element.appendChild(inner);
      }
      super.init(options);
    }

    setOptions(options) {
      let updateDOW;

      if (hasProperty(options, 'minDate')) {
        this.minDate = options.minDate;
      }
      if (hasProperty(options, 'maxDate')) {
        this.maxDate = options.maxDate;
      }
      if (options.datesDisabled) {
        this.datesDisabled = options.datesDisabled;
      }
      if (options.daysOfWeekDisabled) {
        this.daysOfWeekDisabled = options.daysOfWeekDisabled;
        updateDOW = true;
      }
      if (options.daysOfWeekHighlighted) {
        this.daysOfWeekHighlighted = options.daysOfWeekHighlighted;
      }
      if (options.todayHighlight !== undefined) {
        this.todayHighlight = options.todayHighlight;
      }
      if (options.weekStart !== undefined) {
        this.weekStart = options.weekStart;
        this.weekEnd = options.weekEnd;
        updateDOW = true;
      }
      if (options.locale) {
        const locale = this.locale = options.locale;
        this.dayNames = locale.daysMin;
        this.switchLabelFormat = locale.titleFormat;
        this.switchLabel = formatDate(this.picker.viewDate, locale.titleFormat, locale);
        updateDOW = true;
      }
      if (options.beforeShowDay !== undefined) {
        this.beforeShow = typeof options.beforeShowDay === 'function'
          ? options.beforeShowDay
          : undefined;
      }

      if (options.calendarWeeks !== undefined) {
        if (options.calendarWeeks && !this.calendarWeeks) {
          const weeksElem = parseHTML(calendarWeeksTemplate).firstChild;
          this.calendarWeeks = {
            element: weeksElem,
            dow: weeksElem.firstChild,
            weeks: weeksElem.lastChild,
          };
          this.element.insertBefore(weeksElem, this.element.firstChild);
        } else if (this.calendarWeeks && !options.calendarWeeks) {
          this.element.removeChild(this.calendarWeeks.element);
          this.calendarWeeks = null;
        }
      }
      if (options.showDaysOfWeek !== undefined) {
        if (options.showDaysOfWeek) {
          showElement(this.dow);
          if (this.calendarWeeks) {
            showElement(this.calendarWeeks.dow);
          }
        } else {
          hideElement(this.dow);
          if (this.calendarWeeks) {
            hideElement(this.calendarWeeks.dow);
          }
        }
      }

      // update days-of-week when locale, daysOfweekDisabled or weekStart is changed
      if (updateDOW) {
        Array.from(this.dow.children).forEach((el, index) => {
          const dow = (this.weekStart + index) % 7;
          el.textContent = this.dayNames[dow];
          el.className = this.daysOfWeekDisabled.includes(dow) ? 'dow disabled' : 'dow';
        });
      }
    }

    // Apply update on the focused date to view's settings
    updateFocus() {
      const viewDate = new Date(this.picker.viewDate);
      const viewYear = viewDate.getFullYear();
      const viewMonth = viewDate.getMonth();
      const firstOfMonth = dateValue(viewYear, viewMonth, 1);
      const start = dayOfTheWeekOf(firstOfMonth, this.weekStart, this.weekStart);

      this.first = firstOfMonth;
      this.last = dateValue(viewYear, viewMonth + 1, 0);
      this.start = start;

      this.switchLabel = formatDate(viewDate, this.switchLabelFormat, this.locale);
      this.focused = this.picker.viewDate;
    }

    // Apply update on the selected dates to view's settings
    updateSelection() {
      const {dates, range} = this.picker.datepicker;
      this.selected = dates;
      this.range = range;
    }

     // Update the entire view UI
    render() {
      // update today marker on ever render
      this.today = this.todayHighlight ? today() : undefined;
      // refresh disabled dates on every render in order to clear the ones added
      // by beforeShow hook at previous render
      this.disabled = [...this.datesDisabled];

      this.picker.setViewSwitchLabel(this.switchLabel);
      this.picker.setPrevBtnDisabled(this.first <= this.minDate);
      this.picker.setNextBtnDisabled(this.last >= this.maxDate);

      if (this.calendarWeeks) {
        // start of the UTC week (Monday) of the 1st of the month
        const startOfWeek = dayOfTheWeekOf(this.first, 1, 1);
        Array.from(this.calendarWeeks.weeks.children).forEach((el, index) => {
          el.textContent = getWeek(addWeeks(startOfWeek, index));
        });
      }
      Array.from(this.grid.children).forEach((el, index) => {
        const classList = el.classList;
        const current = addDays(this.start, index);
        const date = new Date(current);
        const day = date.getDay();

        el.className = `datepicker-cell ${this.cellClass}`;
        el.dataset.date = current;
        el.textContent = date.getDate();

        if (current < this.first) {
          classList.add('prev');
        } else if (current > this.last) {
          classList.add('next');
        }
        if (this.today === current) {
          classList.add('today');
        }
        if (current < this.minDate || current > this.maxDate || this.disabled.includes(current)) {
          classList.add('disabled');
        }
        if (this.daysOfWeekDisabled.includes(day)) {
          classList.add('disabled');
          pushUnique(this.disabled, current);
        }
        if (this.daysOfWeekHighlighted.includes(day)) {
          classList.add('highlighted');
        }
        if (this.range){
          const [rangeStart, rangeEnd] = this.range;
          if (current > rangeStart && current < rangeEnd) {
            classList.add('range');
          }
          if (current === rangeStart) {
            classList.add('range-start');
          }
          if (current === rangeEnd) {
            classList.add('range-end');
          }
        }
        if (this.selected.includes(current)) {
          classList.add('selected');
        }
        if (current === this.focused) {
          classList.add('focused');
        }

        if (this.beforeShow) {
          this.performBeforeHook(el, current, current);
        }
      });
    }

    // Update the view UI by applying the changes of selected and focused items
    refresh() {
      const [rangeStart, rangeEnd] = this.range || [];
      this.grid
        .querySelectorAll('.range, .range-start, .range-end, .selected, .focused')
        .forEach((el) => {
          el.classList.remove('range', 'range-start', 'range-end', 'selected', 'focused');
        });
      Array.from(this.grid.children).forEach((el) => {
        const current = Number(el.dataset.date);
        const classList = el.classList;
        if (current > rangeStart && current < rangeEnd) {
          classList.add('range');
        }
        if (current === rangeStart) {
          classList.add('range-start');
        }
        if (current === rangeEnd) {
          classList.add('range-end');
        }
        if (this.selected.includes(current)) {
          classList.add('selected');
        }
        if (current === this.focused) {
          classList.add('focused');
        }
      });
    }

    // Update the view UI by applying the change of focused item
    refreshFocus() {
      const index = Math.round((this.focused - this.start) / 86400000);
      this.grid.querySelectorAll('.focused').forEach((el) => {
        el.classList.remove('focused');
      });
      this.grid.children[index].classList.add('focused');
    }
  }

  class MonthsView extends View {
    constructor(picker) {
      super(picker, {
        id: 1,
        name: 'months',
        cellClass: 'month',
      });
    }

    init(options, onConstruction = true) {
      if (onConstruction) {
        this.grid = this.element;
        this.element.classList.add('months', 'datepicker-grid');
        this.grid.appendChild(parseHTML(createTagRepeat('span', 12, {'data-month': ix => ix})));
      }
      super.init(options);
    }

    setOptions(options) {
      if (options.locale) {
        this.monthNames = options.locale.monthsShort;
      }
      if (hasProperty(options, 'minDate')) {
        if (options.minDate === undefined) {
          this.minYear = this.minMonth = this.minDate = undefined;
        } else {
          const minDateObj = new Date(options.minDate);
          this.minYear = minDateObj.getFullYear();
          this.minMonth = minDateObj.getMonth();
          this.minDate = minDateObj.setDate(1);
        }
      }
      if (hasProperty(options, 'maxDate')) {
        if (options.maxDate === undefined) {
          this.maxYear = this.maxMonth = this.maxDate = undefined;
        } else {
          const maxDateObj = new Date(options.maxDate);
          this.maxYear = maxDateObj.getFullYear();
          this.maxMonth = maxDateObj.getMonth();
          this.maxDate = dateValue(this.maxYear, this.maxMonth + 1, 0);
        }
      }
      if (options.beforeShowMonth !== undefined) {
        this.beforeShow = typeof options.beforeShowMonth === 'function'
          ? options.beforeShowMonth
          : undefined;
      }
    }

    // Update view's settings to reflect the viewDate set on the picker
    updateFocus() {
      const viewDate = new Date(this.picker.viewDate);
      this.year = viewDate.getFullYear();
      this.switchLabel = this.year;
      this.focused = viewDate.getMonth();
    }

    // Update view's settings to reflect the selected dates
    updateSelection() {
      this.selected = this.picker.datepicker.dates.reduce((selected, timeValue) => {
        const date = new Date(timeValue);
        const year = date.getFullYear();
        const month = date.getMonth();
        if (selected[year] === undefined) {
          selected[year] = [month];
        } else {
          pushUnique(selected[year], month);
        }
        return selected;
      }, {});
    }

    // Update the entire view UI
    render() {
      // refresh disabled months on every render in order to clear the ones added
      // by beforeShow hook at previous render
      this.disabled = [];

      this.picker.setViewSwitchLabel(this.switchLabel);
      this.picker.setPrevBtnDisabled(this.year <= this.minYear);
      this.picker.setNextBtnDisabled(this.year >= this.maxYear);

      const selected = this.selected[this.year] || [];
      const yrOutOfRange = this.year < this.minYear || this.year > this.maxYear;
      const isMinYear = this.year === this.minYear;
      const isMaxYear = this.year === this.maxYear;
      Array.from(this.grid.children).forEach((el, index) => {
        const classList = el.classList;

        el.className = `datepicker-cell ${this.cellClass}`;
        // reset text on every render to clear the custom content set
        // by beforeShow hook at previous render
        el.textContent = this.monthNames[index];

        if (
          yrOutOfRange
          || isMinYear && index < this.minMonth
          || isMaxYear && index > this.maxMonth
        ) {
          classList.add('disabled');
        }
        if (selected.includes(index)) {
          classList.add('selected');
        }
        if (index === this.focused) {
          classList.add('focused');
        }

        if (this.beforeShow) {
          this.performBeforeHook(el, index, dateValue(this.year, index, 1));
        }
      });
    }

    // Update the view UI by applying the changes of selected and focused items
    refresh() {
      const selected = this.selected[this.year] || [];
      this.grid.querySelectorAll('.selected, .focused').forEach((el) => {
        el.classList.remove('selected', 'focused');
      });
      Array.from(this.grid.children).forEach((el, index) => {
        const classList = el.classList;
        if (selected.includes(index)) {
          classList.add('selected');
        }
        if (index === this.focused) {
          classList.add('focused');
        }
      });
    }

    // Update the view UI by applying the change of focused item
    refreshFocus() {
      this.grid.querySelectorAll('.focused').forEach((el) => {
        el.classList.remove('focused');
      });
      this.grid.children[this.focused].classList.add('focused');
    }
  }

  function toTitleCase(word) {
    return [...word].reduce((str, ch, ix) => str += ix ? ch : ch.toUpperCase(), '');
  }

  // Class representing the years and decades view elements
  class YearsView extends View {
    constructor(picker, config) {
      super(picker, config);
    }

    init(options, onConstruction = true) {
      if (onConstruction) {
        this.navStep = this.step * 10;
        this.beforeShowOption = `beforeShow${toTitleCase(this.cellClass)}`;
        this.grid = this.element;
        this.element.classList.add(this.name, 'datepicker-grid');
        this.grid.appendChild(parseHTML(createTagRepeat('span', 12)));
      }
      super.init(options);
    }

    setOptions(options) {
      if (hasProperty(options, 'minDate')) {
        if (options.minDate === undefined) {
          this.minYear = this.minDate = undefined;
        } else {
          this.minYear = startOfYearPeriod(options.minDate, this.step);
          this.minDate = dateValue(this.minYear, 0, 1);
        }
      }
      if (hasProperty(options, 'maxDate')) {
        if (options.maxDate === undefined) {
          this.maxYear = this.maxDate = undefined;
        } else {
          this.maxYear = startOfYearPeriod(options.maxDate, this.step);
          this.maxDate = dateValue(this.maxYear, 11, 31);
        }
      }
      if (options[this.beforeShowOption] !== undefined) {
        const beforeShow = options[this.beforeShowOption];
        this.beforeShow = typeof beforeShow === 'function' ? beforeShow : undefined;
      }
    }

    // Update view's settings to reflect the viewDate set on the picker
    updateFocus() {
      const viewDate = new Date(this.picker.viewDate);
      const first = startOfYearPeriod(viewDate, this.navStep);
      const last = first + 9 * this.step;

      this.first = first;
      this.last = last;
      this.start = first - this.step;
      this.switchLabel = `${first}-${last}`;
      this.focused = startOfYearPeriod(viewDate, this.step);
    }

    // Update view's settings to reflect the selected dates
    updateSelection() {
      this.selected = this.picker.datepicker.dates.reduce((years, timeValue) => {
        return pushUnique(years, startOfYearPeriod(timeValue, this.step));
      }, []);
    }

    // Update the entire view UI
    render() {
      // refresh disabled years on every render in order to clear the ones added
      // by beforeShow hook at previous render
      this.disabled = [];

      this.picker.setViewSwitchLabel(this.switchLabel);
      this.picker.setPrevBtnDisabled(this.first <= this.minYear);
      this.picker.setNextBtnDisabled(this.last >= this.maxYear);

      Array.from(this.grid.children).forEach((el, index) => {
        const classList = el.classList;
        const current = this.start + (index * this.step);

        el.className = `datepicker-cell ${this.cellClass}`;
        el.textContent = el.dataset.year = current;

        if (index === 0) {
          classList.add('prev');
        } else if (index === 11) {
          classList.add('next');
        }
        if (current < this.minYear || current > this.maxYear) {
          classList.add('disabled');
        }
        if (this.selected.includes(current)) {
          classList.add('selected');
        }
        if (current === this.focused) {
          classList.add('focused');
        }

        if (this.beforeShow) {
          this.performBeforeHook(el, current, dateValue(current, 0, 1));
        }
      });
    }

    // Update the view UI by applying the changes of selected and focused items
    refresh() {
      this.grid.querySelectorAll('.selected, .focused').forEach((el) => {
        el.classList.remove('selected', 'focused');
      });
      Array.from(this.grid.children).forEach((el) => {
        const current = Number(el.textContent);
        const classList = el.classList;
        if (this.selected.includes(current)) {
          classList.add('selected');
        }
        if (current === this.focused) {
          classList.add('focused');
        }
      });
    }

    // Update the view UI by applying the change of focused item
    refreshFocus() {
      const index = Math.round((this.focused - this.start) / this.step);
      this.grid.querySelectorAll('.focused').forEach((el) => {
        el.classList.remove('focused');
      });
      this.grid.children[index].classList.add('focused');
    }
  }

  function triggerDatepickerEvent(datepicker, type) {
    const detail = {
      date: datepicker.getDate(),
      viewDate: new Date(datepicker.picker.viewDate),
      viewId: datepicker.picker.currentView.id,
      datepicker,
    };
    datepicker.element.dispatchEvent(new CustomEvent(type, {detail}));
  }

  // direction: -1 (to previous), 1 (to next)
  function goToPrevOrNext(datepicker, direction) {
    const {minDate, maxDate} = datepicker.config;
    const {currentView, viewDate} = datepicker.picker;
    let newViewDate;
    switch (currentView.id) {
      case 0:
        newViewDate = addMonths(viewDate, direction);
        break;
      case 1:
        newViewDate = addYears(viewDate, direction);
        break;
      default:
        newViewDate = addYears(viewDate, direction * currentView.navStep);
    }
    newViewDate = limitToRange(newViewDate, minDate, maxDate);
    datepicker.picker.changeFocus(newViewDate).render();
  }

  function switchView(datepicker) {
    const viewId = datepicker.picker.currentView.id;
    if (viewId === datepicker.config.maxView) {
      return;
    }
    datepicker.picker.changeView(viewId + 1).render();
  }

  function goToSelectedMonthOrYear(datepicker, selection) {
    const picker = datepicker.picker;
    const viewDate = new Date(picker.viewDate);
    const viewId = picker.currentView.id;
    const newDate = viewId === 1
      ? addMonths(viewDate, selection - viewDate.getMonth())
      : addYears(viewDate, selection - viewDate.getFullYear());

    picker.changeFocus(newDate).changeView(viewId - 1).render();
  }

  function onClickTodayBtn(datepicker) {
    const picker = datepicker.picker;
    const currentDate = today();
    if (datepicker.config.todayBtnMode === 1) {
      if (datepicker.config.autohide) {
        datepicker.setDate(currentDate);
        return;
      }
      datepicker.setDate(currentDate, {render: false});
      picker.update();
    }
    if (picker.viewDate !== currentDate) {
      picker.changeFocus(currentDate);
    }
    picker.changeView(0).render();
  }

  function onClickClearBtn(datepicker) {
    datepicker.setDate({clear: true});
  }

  function onClickViewSwitch(datepicker) {
    switchView(datepicker);
  }

  function onClickPrevBtn(datepicker) {
    goToPrevOrNext(datepicker, -1);
  }

  function onClickNextBtn(datepicker) {
    goToPrevOrNext(datepicker, 1);
  }

  // For the picker's main block to delegete the events from `datepicker-cell`s
  function onClickView(datepicker, ev) {
    const target = findElementInEventPath(ev, '.datepicker-cell');
    if (!target || target.classList.contains('disabled')) {
      return;
    }

    switch (datepicker.picker.currentView.id) {
      case 0:
        datepicker.setDate(Number(target.dataset.date));
        break;
      case 1:
        goToSelectedMonthOrYear(datepicker, Number(target.dataset.month));
        break;
      default:
        goToSelectedMonthOrYear(datepicker, Number(target.dataset.year));
    }
  }

  function onClickPicker(datepicker, ev) {
    ev.preventDefault();
    ev.stopPropagation();

    // check if the picker is active in order to prevent the picker from being
    // re-shown after auto-hide when showOnFocus: true
    // it's caused by bubbled event from cells/buttons, but the bubbling cannot
    // be disabled because it's needed to keep the focus on the input element
    if (!datepicker.inline && datepicker.picker.active && !datepicker.config.disableTouchKeyboard) {
      datepicker.inputField.focus();
    }
  }

  function processPickerOptions(picker, options) {
    if (options.title !== undefined) {
      if (options.title) {
        picker.controls.title.textContent = options.title;
        showElement(picker.controls.title);
      } else {
        picker.controls.title.textContent = '';
        hideElement(picker.controls.title);
      }
    }
    if (options.prevArrow) {
      const prevBtn = picker.controls.prevBtn;
      emptyChildNodes(prevBtn);
      options.prevArrow.forEach((node) => {
        prevBtn.appendChild(node.cloneNode(true));
      });
    }
    if (options.nextArrow) {
      const nextBtn = picker.controls.nextBtn;
      emptyChildNodes(nextBtn);
      options.nextArrow.forEach((node) => {
        nextBtn.appendChild(node.cloneNode(true));
      });
    }
    if (options.locale) {
      picker.controls.todayBtn.textContent = options.locale.today;
      picker.controls.clearBtn.textContent = options.locale.clear;
    }
    if (options.todayBtn !== undefined) {
      if (options.todayBtn) {
        showElement(picker.controls.todayBtn);
      } else {
        hideElement(picker.controls.todayBtn);
      }
    }
    if (hasProperty(options, 'minDate') || hasProperty(options, 'maxDate')) {
      const {minDate, maxDate} = picker.datepicker.config;
      picker.controls.todayBtn.disabled = !isInRange(today(), minDate, maxDate);
    }
    if (options.clearBtn !== undefined) {
      if (options.clearBtn) {
        showElement(picker.controls.clearBtn);
      } else {
        hideElement(picker.controls.clearBtn);
      }
    }
  }

  // Compute view date to reset, which will be...
  // - the last item of the selected dates or defaultViewDate if no selection
  // - limitted to minDate or maxDate if it exceeds the range
  function computeResetViewDate(datepicker) {
    const {dates, config} = datepicker;
    const viewDate = dates.length > 0 ? lastItemOf(dates) : config.defaultViewDate;
    return limitToRange(viewDate, config.minDate, config.maxDate);
  }

  // Change current view's view date
  function setViewDate(picker, newDate) {
    const oldViewDate = new Date(picker.viewDate);
    const newViewDate = new Date(newDate);
    const {id, year, first, last} = picker.currentView;
    const viewYear = newViewDate.getFullYear();

    picker.viewDate = newDate;
    if (viewYear !== oldViewDate.getFullYear()) {
      triggerDatepickerEvent(picker.datepicker, 'changeYear');
    }
    if (newViewDate.getMonth() !== oldViewDate.getMonth()) {
      triggerDatepickerEvent(picker.datepicker, 'changeMonth');
    }

    // return whether the new date is in different period on time from the one
    // displayed in the current view
    // when true, the view needs to be re-rendered on the next UI refresh.
    switch (id) {
      case 0:
        return newDate < first || newDate > last;
      case 1:
        return viewYear !== year;
      default:
        return viewYear < first || viewYear > last;
    }
  }

  function getTextDirection(el) {
    return window.getComputedStyle(el).direction;
  }

  // Class representing the picker UI
  class Picker {
    constructor(datepicker) {
      this.datepicker = datepicker;

      const template = pickerTemplate.replace(/%buttonClass%/g, datepicker.config.buttonClass);
      const element = this.element = parseHTML(template).firstChild;
      const [header, main, footer] = element.firstChild.children;
      const title = header.firstElementChild;
      const [prevBtn, viewSwitch, nextBtn] = header.lastElementChild.children;
      const [todayBtn, clearBtn] = footer.firstChild.children;
      const controls = {
        title,
        prevBtn,
        viewSwitch,
        nextBtn,
        todayBtn,
        clearBtn,
      };
      this.main = main;
      this.controls = controls;

      const elementClass = datepicker.inline ? 'inline' : 'dropdown';
      element.classList.add(`datepicker-${elementClass}`);

      processPickerOptions(this, datepicker.config);
      this.viewDate = computeResetViewDate(datepicker);

      // set up event listeners
      registerListeners(datepicker, [
        [element, 'click', onClickPicker.bind(null, datepicker)],
        [main, 'click', onClickView.bind(null, datepicker)],
        [controls.viewSwitch, 'click', onClickViewSwitch.bind(null, datepicker)],
        [controls.prevBtn, 'click', onClickPrevBtn.bind(null, datepicker)],
        [controls.nextBtn, 'click', onClickNextBtn.bind(null, datepicker)],
        [controls.todayBtn, 'click', onClickTodayBtn.bind(null, datepicker)],
        [controls.clearBtn, 'click', onClickClearBtn.bind(null, datepicker)],
      ]);

      // set up views
      this.views = [
        new DaysView(this),
        new MonthsView(this),
        new YearsView(this, {id: 2, name: 'years', cellClass: 'year', step: 1}),
        new YearsView(this, {id: 3, name: 'decades', cellClass: 'decade', step: 10}),
      ];
      this.currentView = this.views[datepicker.config.startView];

      this.currentView.render();
      this.main.appendChild(this.currentView.element);
      datepicker.config.container.appendChild(this.element);
    }

    setOptions(options) {
      processPickerOptions(this, options);
      this.views.forEach((view) => {
        view.init(options, false);
      });
      this.currentView.render();
    }

    detach(){
      this.datepicker.config.container.removeChild(this.element);
    }

    show() {
      if (this.active) {
        return;
      }
      this.element.classList.add('active');
      this.active = true;

      const datepicker = this.datepicker;
      if (!datepicker.inline) {
        // ensure picker's direction matches input's
        const inputDirection = getTextDirection(datepicker.inputField);
        if (inputDirection !== getTextDirection(datepicker.config.container)) {
          this.element.dir = inputDirection;
        } else if (this.element.dir) {
          this.element.removeAttribute('dir');
        }

        this.place();
        if (datepicker.config.disableTouchKeyboard) {
          datepicker.inputField.blur();
        }
      }
      triggerDatepickerEvent(datepicker, 'show');
    }

    hide() {
      if (!this.active) {
        return;
      }
      this.datepicker.exitEditMode();
      this.element.classList.remove('active');
      this.active = false;
      triggerDatepickerEvent(this.datepicker, 'hide');
    }

    place() {
      const {classList, style} = this.element;
      const {config, inputField} = this.datepicker;
      const container = config.container;
      const {
        width: calendarWidth,
        height: calendarHeight,
      } = this.element.getBoundingClientRect();
      const {
        left: containerLeft,
        top: containerTop,
        width: containerWidth,
      } = container.getBoundingClientRect();
      const {
        left: inputLeft,
        top: inputTop,
        width: inputWidth,
        height: inputHeight
      } = inputField.getBoundingClientRect();
      let {x: orientX, y: orientY} = config.orientation;
      let scrollTop;
      let left;
      let top;

      if (container === document.body) {
        scrollTop = window.scrollY;
        left = inputLeft + window.scrollX;
        top = inputTop + scrollTop;
      } else {
        scrollTop = container.scrollTop;
        left = inputLeft - containerLeft;
        top = inputTop - containerTop + scrollTop;
      }

      if (orientX === 'auto') {
        if (left < 0) {
          // align to the left and move into visible area if input's left edge < window's
          orientX = 'left';
          left = 10;
        } else if (left + calendarWidth > containerWidth) {
          // align to the right if canlendar's right edge > container's
          orientX = 'right';
        } else {
          orientX = getTextDirection(inputField) === 'rtl' ? 'right' : 'left';
        }
      }
      if (orientX === 'right') {
        left -= calendarWidth - inputWidth;
      }

      if (orientY === 'auto') {
        orientY = top - calendarHeight < scrollTop ? 'bottom' : 'top';
      }
      if (orientY === 'top') {
        top -= calendarHeight;
      } else {
        top += inputHeight;
      }

      classList.remove(
        'datepicker-orient-top',
        'datepicker-orient-bottom',
        'datepicker-orient-right',
        'datepicker-orient-left'
      );
      classList.add(`datepicker-orient-${orientY}`, `datepicker-orient-${orientX}`);

      style.top = top ? `${top}px` : top;
      style.left = left ? `${left}px` : left;
    }

    setViewSwitchLabel(labelText) {
      this.controls.viewSwitch.textContent = labelText;
    }

    setPrevBtnDisabled(disabled) {
      this.controls.prevBtn.disabled = disabled;
    }

    setNextBtnDisabled(disabled) {
      this.controls.nextBtn.disabled = disabled;
    }

    changeView(viewId) {
      const oldView = this.currentView;
      const newView =  this.views[viewId];
      if (newView.id !== oldView.id) {
        this.currentView = newView;
        this._renderMethod = 'render';
        triggerDatepickerEvent(this.datepicker, 'changeView');
        this.main.replaceChild(newView.element, oldView.element);
      }
      return this;
    }

    // Change the focused date (view date)
    changeFocus(newViewDate) {
      this._renderMethod = setViewDate(this, newViewDate) ? 'render' : 'refreshFocus';
      this.views.forEach((view) => {
        view.updateFocus();
      });
      return this;
    }

    // Apply the change of the selected dates
    update() {
      const newViewDate = computeResetViewDate(this.datepicker);
      this._renderMethod = setViewDate(this, newViewDate) ? 'render' : 'refresh';
      this.views.forEach((view) => {
        view.updateFocus();
        view.updateSelection();
      });
      return this;
    }

    // Refresh the picker UI
    render() {
      const renderMethod = this._renderMethod || 'render';
      delete this._renderMethod;

      this.currentView[renderMethod]();
    }
  }

  // Find the closest date that doesn't meet the condition for unavailable date
  // Returns undefined if no available date is found
  // addFn: function to calculate the next date
  //   - args: time value, amount
  // increase: amount to pass to addFn
  // testFn: function to test the unavailablity of the date
  //   - args: time value; retun: true if unavailable
  function findNextAvailableOne(date, addFn, increase, testFn, min, max) {
    if (!isInRange(date, min, max)) {
      return;
    }
    if (testFn(date)) {
      const newDate = addFn(date, increase);
      return findNextAvailableOne(newDate, addFn, increase, testFn, min, max);
    }
    return date;
  }

  // direction: -1 (left/up), 1 (right/down)
  // vertical: true for up/down, false for left/right
  function moveByArrowKey(datepicker, ev, direction, vertical) {
    const currentView = datepicker.picker.currentView;
    const step = currentView.step || 1;
    let viewDate = datepicker.picker.viewDate;
    let addFn;
    let testFn;
    switch (currentView.id) {
      case 0:
        if (vertical) {
          viewDate = addDays(viewDate, direction * 7);
        } else if (ev.ctrlKey || ev.metaKey) {
          viewDate = addYears(viewDate, direction);
        } else {
          viewDate = addDays(viewDate, direction);
        }
        addFn = addDays;
        testFn = (date) => currentView.disabled.includes(date);
        break;
      case 1:
        viewDate = addMonths(viewDate, vertical ? direction * 4 : direction);
        addFn = addMonths;
        testFn = (date) => {
          const dt = new Date(date);
          const {year, disabled} = currentView;
          return dt.getFullYear() === year && disabled.includes(dt.getMonth());
        };
        break;
      default:
        viewDate = addYears(viewDate, direction * (vertical ? 4 : 1) * step);
        addFn = addYears;
        testFn = date => currentView.disabled.includes(startOfYearPeriod(date, step));
    }
    viewDate = findNextAvailableOne(
      viewDate,
      addFn,
      direction < 0 ? -step : step,
      testFn,
      currentView.minDate,
      currentView.maxDate
    );
    if (viewDate !== undefined) {
      datepicker.picker.changeFocus(viewDate).render();
    }
  }

  function onKeydown(datepicker, ev) {
    if (ev.key === 'Tab') {
      datepicker.refresh('input');
      datepicker.hide();
      return;
    }

    const viewId = datepicker.picker.currentView.id;
    if (!datepicker.picker.active) {
      switch (ev.key) {
        case 'ArrowDown':
        case 'Escape':
          datepicker.picker.show();
          break;
        case 'Enter':
          datepicker.update();
          break;
        default:
          return;
      }
    } else if (datepicker.editMode) {
      switch (ev.key) {
        case 'Escape':
          datepicker.exitEditMode();
          break;
        case 'Enter':
          datepicker.exitEditMode({update: true, autohide: datepicker.config.autohide});
          break;
        default:
          return;
      }
    } else {
      switch (ev.key) {
        case 'Escape':
          if (ev.shiftKey) {
            datepicker.enterEditMode();
          } else {
            datepicker.picker.hide();
          }
          break;
        case 'ArrowLeft':
          if (ev.ctrlKey || ev.metaKey) {
            goToPrevOrNext(datepicker, -1);
          } else {
            moveByArrowKey(datepicker, ev, -1, false);
          }
          break;
        case 'ArrowRight':
          if (ev.ctrlKey || ev.metaKey) {
            goToPrevOrNext(datepicker, 1);
          } else {
            moveByArrowKey(datepicker, ev, 1, false);
          }
          break;
        case 'ArrowUp':
          if (ev.ctrlKey || ev.metaKey) {
            switchView(datepicker);
          } else {
            moveByArrowKey(datepicker, ev, -1, true);
          }
          break;
        case 'ArrowDown':
          moveByArrowKey(datepicker, ev, 1, true);
          break;
        case 'Enter':
          if (viewId === 0) {
            datepicker.setDate(datepicker.picker.viewDate);
          } else {
            datepicker.picker.changeView(viewId - 1).render();
          }
          break;
        case 'Backspace':
        case 'Delete':
          datepicker.enterEditMode();
          return;
        default:
          if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) {
            datepicker.enterEditMode();
          }
          return;
      }
    }
    ev.preventDefault();
    ev.stopPropagation();
  }

  function onFocus(datepicker) {
    if (datepicker.config.showOnFocus) {
      datepicker.show();
    }
  }

  // for the prevention for entering edit mode while getting focus on click
  function onMousedown(datepicker, ev) {
    const el = ev.target;
    if (datepicker.picker.active) {
      el._clicking = setTimeout(() => {
        delete el._clicking;
      }, 2000);
    }
  }

  function onClickInput(datepicker, ev) {
    const el = ev.target;
    if (!el._clicking) {
      return;
    }
    clearTimeout(el._clicking);
    delete el._clicking;

    datepicker.enterEditMode();
  }

  function onPaste(datepicker, ev) {
    if (ev.clipboardData.types.includes('text/plain')) {
      datepicker.enterEditMode();
    }
  }

  // for the `document` to delegate the events from outside the picker/input field
  function onClickOutside(datepicker, ev) {
    const element = datepicker.element;
    const pickerElem = datepicker.picker.element;

    if (findElementInEventPath(ev, el => el === element || el === pickerElem)) {
      return;
    }
    datepicker.refresh('input');
    datepicker.hide();
  }

  function stringifyDates(dates, config) {
    return dates
      .map(dt => formatDate(dt, config.format, config.locale))
      .join(config.dateDelimiter);
  }

  // parse input dates and create an array of time values for selection
  // returns undefined if there are no valid dates in inputDates
  // when origDates (current selection) is passed, the function works to mix
  // the input dates into the current selection
  function processInputDates(inputDates, config, origDates = undefined) {
    if (inputDates.length === 0) {
      // empty input is considered valid unless origiDates is passed
      return origDates ? undefined : [];
    }

    let newDates = inputDates.reduce((dates, dt) => {
      const date = parseDate(dt, config.format, config.locale);
      if (
        date !== undefined
        && isInRange(date, config.minDate, config.maxDate)
        && !dates.includes(date)
        && !config.datesDisabled.includes(date)
        && !config.daysOfWeekDisabled.includes(new Date(date).getDay())
      ) {
        dates.push(date);
      }
      return dates;
    }, []);
    if (newDates.length === 0) {
      return;
    }
    if (origDates && config.multidate) {
      // get the synmetric difference between origDates and newDates
      newDates = newDates.reduce((dates, date) => {
        if (!origDates.includes(date)) {
          dates.push(date);
        }
        return dates;
      }, origDates.filter(date => !newDates.includes(date)));
    }
    // do length check always because user can input multiple dates regardless of the mode
    return config.maxNumberOfDates && newDates.length > config.maxNumberOfDates
      ? newDates.slice(config.maxNumberOfDates * -1)
      : newDates;
  }

  /**
   * Class representing a date picker
   */
  class Datepicker {
    /**
     * Create a date picker
     * @param  {Element} element - element to bind a date picker
     * @param  {Object} [options] - config options
     * @param  {DateRangePicker} [rangepicker] - DateRangePicker instance the
     * date picker belongs to. Use this only when creating date picker as a part
     * of date range picker
     */
    constructor(element, options = {}, rangepicker = undefined) {
      element.datepicker = this;
      this.element = element;

      // set up config
      const config = this.config = Object.assign({
        buttonClass: (options.buttonClass && String(options.buttonClass)) || 'button',
        container: document.body,
        defaultViewDate: today(),
        maxDate: undefined,
        minDate: undefined,
      }, processOptions(defaultOptions, this));
      this._options = options;
      Object.assign(config, processOptions(options, this));

      // configure by type
      const inline = this.inline = element.tagName !== 'INPUT';
      let inputField;
      let initialDates;

      if (inline) {
        config.container = element;
        initialDates = stringToArray(element.dataset.date, config.dateDelimiter);
        delete element.dataset.date;
      } else {
        const container = options.container ? document.querySelector(options.container) : null;
        if (container) {
          config.container = container;
        }
        inputField = this.inputField = element;
        inputField.classList.add('datepicker-input');
        initialDates = stringToArray(inputField.value, config.dateDelimiter);
      }
      // set initial value
      this.dates = processInputDates(initialDates, config) || [];

      if (rangepicker && rangepicker.constructor.name === 'DateRangePicker') {
        this.rangepicker = rangepicker;
        // add getter for range
        Object.defineProperty(this, 'range', {
          get() {
            return this.rangepicker.dates;
          },
        });
      }

      const picker = this.picker = new Picker(this);

      if (inline) {
        this.show();
      } else {
        // set up event listeners in other modes
        const onMousedownDocument = onClickOutside.bind(null, this);
        const listeners = [
          [inputField, 'keydown', onKeydown.bind(null, this)],
          [inputField, 'focus', onFocus.bind(null, this)],
          [inputField, 'mousedown', onMousedown.bind(null, this)],
          [inputField, 'click', onClickInput.bind(null, this)],
          [inputField, 'paste', onPaste.bind(null, this)],
          [document, 'mousedown', onMousedownDocument],
          [document, 'touchstart', onMousedownDocument],
          [window, 'resize', picker.place.bind(picker)]
        ];
        registerListeners(this, listeners);
      }
    }

    /**
     * Format Date object or time value in given format and language
     * @param  {Date|Number} date - date or time value to format
     * @param  {String|Object} format - format string or object that contains
     * toDisplay() custom formatter, whose signature is
     * - args:
     *   - date: {Date} - Date instance of the date passed to the method
     *   - format: {Object} - the format object passed to the method
     *   - locale: {Object} - locale for the language specified by `lang`
     * - return:
     *     {String} formatted date
     * @param  {String} [lang=en] - language code for the locale to use
     * @return {String} formatted date
     */
    static formatDate(date, format, lang) {
      return formatDate(date, format, lang && locales[lang] || locales.en);
    }

    /**
     * Pasre date string
     * @param  {String|Date|Number} dateStr - date string, Date object or time
     * value to parse
     * @param  {String|Object} format - format string or object that contains
     * toValue() custom parser, whose signature is
     * - args:
     *   - dateStr: {String|Date|Number} - the dateStr passed to the method
     *   - format: {Object} - the format object passed to the method
     *   - locale: {Object} - locale for the language specified by `lang`
     * - return:
     *     {Date|Number} parsed date or its time value
     * @param  {String} [lang=en] - language code for the locale to use
     * @return {Number} time value of parsed date
     */
    static parseDate(dateStr, format, lang) {
      return parseDate(dateStr, format, lang && locales[lang] || locales.en);
    }

    /**
     * @type {Object} - Installed locales in `[languageCode]: localeObject` format
     * en`:_English (US)_ is pre-installed.
     */
    static get locales() {
      return locales;
    }

    /**
     * @type {Boolean} - Whether the picker element is shown. `true` whne shown
     */
    get active() {
      return !!(this.picker && this.picker.active);
    }

    /**
     * Set new values to the config options
     * @param {Object} options - config options to update
     */
    setOptions(options) {
      const picker = this.picker;
      const newOptions = processOptions(options, this);
      Object.assign(this._options, options);
      Object.assign(this.config, newOptions);
      picker.setOptions(newOptions);

      const currentViewId = picker.currentView.id;
      if (newOptions.maxView < currentViewId) {
        picker.changeView(newOptions.maxView);
      } else if (
        newOptions.startView !== undefined
        && !picker.active
        && newOptions.startView !== currentViewId
      ) {
        picker.changeView(newOptions.startView);
      }

      this.refresh();
    }

    /**
     * Show the picker element
     */
    show() {
      if (this.inputField && this.inputField.disabled) {
        return;
      }
      this.picker.show();
    }

    /**
     * Hide the picker element
     * Not avilable on inline picker
     */
    hide() {
      if (this.inline) {
        return;
      }
      this.picker.hide();
      this.picker.update().changeView(this.config.startView).render();
    }

    /**
     * Destroy the Datepicker instance
     * @return {Detepicker} - the instance destroyed
     */
    destroy() {
      this.hide();
      unregisterListeners(this);
      this.picker.detach();
      if (!this.inline) {
        this.inputField.classList.remove('datepicker-input');
      }
      delete this.element.datepicker;
      return this;
    }

    /**
     * Get the selected date(s)
     *
     * The method returns a Date object of selected date by default, and returns
     * an array of selected dates in multidate mode. If format string is passed,
     * it returns date string(s) formatted in given format.
     *
     * @param  {String} [format] - Format string to stringify the date(s)
     * @return {Date|String|Date[]|String[]} - selected date(s), or if none is
     * selected, empty array in multidate mode and untitled in sigledate mode
     */
    getDate(format = undefined) {
      const callback = format
        ? date => formatDate(date, format, this.config.locale)
        : date => new Date(date);

      if (this.config.multidate) {
        return this.dates.map(callback);
      }
      if (this.dates.length > 0) {
        return callback(this.dates[0]);
      }
    }

    /**
     * Set selected date(s)
     *
     * In multidate mode, you can pass multiple dates as a series of arguments
     * or an array. (Since each date is parsed individually, the type of the
     * dates doesn't have to be the same.)
     * The given dates are used to toggle the select status of each date. The
     * number of selected dates is kept from exceeding the length set to
     * maxNumberOfDates.
     *
     * With clear: true option, the method can be used to clear the selection
     * and to replace the selection instead of toggling in multidate mode.
     * If the option is passed with no date arguments or an empty dates array,
     * it works as "clear" (clear the selection then set nothing), and if the
     * option is passed with new dates to select, it works as "replace" (clear
     * the selection then set the given dates)
     *
     * When render: false option is used, the method omits re-rendering the
     * picker element. In this case, you need to call refresh() method later in
     * order for the picker element to reflect the changes. The input field is
     * refreshed always regardless of this option.
     *
     * When invalid (unparsable, repeated, disabled or out-of-range) dates are
     * passed, the method ignores them and applies only valid ones. In the case
     * that all the given dates are invalid, which is distiguished from passing
     * no dates, the method considers it as an error and leaves the selection
     * untouched.
     *
     * @param {...(Date|Number|String)|Array} [dates] - Date strings, Date
     * objects, time values or mix of those for new selection
     * @param {Object} [options] - function options
     * - clear: {boolean} - Whether to clear the existing selection
     *     defualt: false
     * - render: {boolean} - Whether to re-render the picker element
     *     default: true
     * - autohide: {boolean} - Whether to hide the picker element after re-render
     *     Ignored when used with render: false
     *     default: config.autohide
     */
    setDate(...args) {
      const dates = [...args];
      const opts = {clear: false, render: true, autohide: this.config.autohide};
      const lastArg = lastItemOf(args);
      if (
        typeof lastArg === 'object'
        && !Array.isArray(lastArg)
        && !(lastArg instanceof Date)
      ) {
        Object.assign(opts, dates.pop());
      }

      const inputDates = Array.isArray(dates[0]) ? dates[0] : dates;
      const origDates = opts.clear ? undefined : this.dates;
      const newDates = processInputDates(inputDates, this.config, origDates);
      if (!newDates) {
        return;
      }
      if (newDates.toString() !== this.dates.toString()) {
        this.dates = newDates;
        if (opts.render) {
          this.picker.update();
          this.refresh();
        } else {
          this.refresh('input');
        }
        triggerDatepickerEvent(this, 'changeDate');
      } else {
        this.refresh('input');
      }
      if (opts.render && opts.autohide) {
        this.hide();
      }
    }

    /**
     * Update the selected date(s) with input field's value
     * Not avilable on inline picker
     *
     * The input field will be refreshed with properly formatted date string.
     *
     * @param  {Object} [options] - function options
     * - autohide: {boolean} - whether to hide the picker element after refresh
     *     default: false
     */
    update(options = undefined) {
      if (this.inline) {
        return;
      }

      const opts = Object.assign({autohide: false}, options);
      const inputDates = stringToArray(this.inputField.value, this.config.dateDelimiter);
      const newDates = processInputDates(inputDates, this.config);
      if (!newDates) {
        return;
      }
      if (newDates.toString() !== this.dates.toString()) {
        this.dates = newDates;
        this.picker.update();
        this.refresh();
        triggerDatepickerEvent(this, 'changeDate');
      } else {
        this.refresh('input');
      }
      if (opts.autohide) {
        this.hide();
      }
    }

    /**
     * Refresh the picker element and the associated input field
     * @param {String} [target] - target item when refreshing one item only
     * 'picker' or 'input'
     */
    refresh(target = undefined) {
      if (target !== 'input') {
        this.picker.render();
      }
      if (!this.inline && target !== 'picker') {
        this.inputField.value = stringifyDates(this.dates, this.config);
      }
    }

    /**
     * Enter edit mode
     * Not avilable on inline picker or when the picker element is hidden
     */
    enterEditMode() {
      if (this.inline || !this.picker.active || this.editMode) {
        return;
      }
      this.editMode = true;
      this.inputField.classList.add('in-edit');
    }

    /**
     * Exit from edit mode
     * Not avilable on inline picker
     * @param  {Object} [options] - function options
     * - update: {boolean} - whether to call update() after exiting
     *     If false, input field is revert to the existing selection
     *     default: false
     */
    exitEditMode(options = undefined) {
      if (this.inline || !this.editMode) {
        return;
      }
      const opts = Object.assign({update: false}, options);
      delete this.editMode;
      this.inputField.classList.remove('in-edit');
      if (opts.update) {
        this.update(opts);
      } else {
        this.inputField.value = stringifyDates(this.dates, this.config);
      }
    }
  }

  return Datepicker;

}());

/**
 * Bahasa translation for bootstrap-datepicker
 * Azwar Akbar <azwar.akbar@gmail.com>
 */
(function () {
	Datepicker.locales.id = {
	  days: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
	  daysShort: ["Mgu", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
	  daysMin: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
	  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
	  monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
	  today: "Hari Ini",
	  clear: "Kosongkan"
	};
  }());
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

/*! Hammer.JS - v2.0.8 - 2016-04-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.8';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MeteorEmoji = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["module"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.meteorEmoji = mod.exports;
  }
})(this, function (module) {
  "use strict";

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var MeteorEmoji = function () {
    function MeteorEmoji() {
      _classCallCheck(this, MeteorEmoji);

      this.initiate();
    }

    _createClass(MeteorEmoji, [{
      key: "initiate",
      value: function initiate() {
        var _this = this;

        var emojiInputs = document.querySelectorAll('[data-meteor-emoji="true"], [data-meteor-emoji-large="true"]');

        emojiInputs.forEach(function (element) {
          _this.generateElements(element);
        });
      }
    }, {
      key: "generateElements",
      value: function generateElements(emojiInput) {

        var clickLink = function clickLink(event) {
          // Is inserting via CKEditor
          if ($(emojiInput).parent('div').siblings('.cke').length) {
              CKEDITOR.instances.bodyEditor.insertText(event.target.innerHTML);
          }
          else {
              var caretPos = emojiInput.selectionStart;
              if (caretPos != null) {
                  emojiInput.value = emojiInput.value.substring(0, caretPos) + " " + event.target.innerHTML + emojiInput.value.substring(caretPos);
              }
              else { // is probably contentEditable or something else
                  $(emojiInput).append(event.target.innerHTML);
              }
          }

          //trigger ng-change for angular
          if (typeof angular !== "undefined") {
            angular.element(emojiInput).triggerHandler("change");
          }
        };

        var clickCategory = function clickCategory(event) {
          var caretPos = emojiInput.selectionStart;

          emojiPicker.style.display = "block";

          var hideUls = emojiPicker.querySelectorAll("ul"),
              i = 1,
              l = hideUls.length;

          for (i; i < l; i++) {
            hideUls[i].style.display = "none";
          }

          var backgroundToggle = emojiPicker.querySelectorAll(".category a");

          i = 0, l = backgroundToggle.length;

          for (i; i < l; i++) {
            backgroundToggle[i].style.background = "none";
          }

          emojiPicker.querySelector("." + event.target.id).style.display = "block";
          emojiPicker.querySelector("#" + event.target.id).style.background = "#c2c2c2";
        };

        emojiInput.style.width = "100%";

        var emojiContainer = document.createElement("div");
        emojiContainer.style.position = "relative";

        var parent = emojiInput.parentNode;
        parent.replaceChild(emojiContainer, emojiInput);
        emojiContainer.appendChild(emojiInput);

        var emojiPicker = document.createElement("div");
        emojiPicker.tabIndex = 0;

        if (emojiInput.hasAttribute("data-meteor-emoji-large")) {
          emojiPicker.style.zIndex = "999";
          emojiPicker.style.display = "block";
          emojiPicker.style.width = "100%";
          emojiPicker.style.marginBottom = "15px";
        } else {
          emojiPicker.style.position = "absolute";
          emojiPicker.style.right = "0px";
          emojiPicker.style.top = "30px";
          emojiPicker.style.display = "none";
          emojiPicker.style.width = "400px";
        }
        emojiPicker.style.zIndex = "999";
        emojiPicker.style.overflow = "hidden";
        emojiPicker.style.background = "#fff";
        emojiPicker.style.borderRadius = "5px";
        emojiPicker.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";
        emojiPicker.style.borderRadius = "2px;";
        emojiPicker.style.marginTop = "5px";
        emojiPicker.style.outline = "none";

        var emojiTrigger = document.createElement("a");
        emojiTrigger.style.position = "absolute";
        emojiTrigger.style.top = "10px";
        emojiTrigger.style.right = "10px";
        emojiTrigger.style.textDecoration = "none";
        emojiTrigger.setAttribute("href", "javascript:void(0)");

        emojiTrigger.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 12 14"><path d="M8.9 8.4q-0.3 0.9-1.1 1.5t-1.8 0.6-1.8-0.6-1.1-1.5q-0.1-0.2 0-0.4t0.3-0.2q0.2-0.1 0.4 0t0.2 0.3q0.2 0.6 0.7 1t1.2 0.4 1.2-0.4 0.7-1q0.1-0.2 0.3-0.3t0.4 0 0.3 0.2 0 0.4zM5 5q0 0.4-0.3 0.7t-0.7 0.3-0.7-0.3-0.3-0.7 0.3-0.7 0.7-0.3 0.7 0.3 0.3 0.7zM9 5q0 0.4-0.3 0.7t-0.7 0.3-0.7-0.3-0.3-0.7 0.3-0.7 0.7-0.3 0.7 0.3 0.3 0.7zM11 7q0-1-0.4-1.9t-1.1-1.6-1.6-1.1-1.9-0.4-1.9 0.4-1.6 1.1-1.1 1.6-0.4 1.9 0.4 1.9 1.1 1.6 1.6 1.1 1.9 0.4 1.9-0.4 1.6-1.1 1.1-1.6 0.4-1.9zM12 7q0 1.6-0.8 3t-2.2 2.2-3 0.8-3-0.8-2.2-2.2-0.8-3 0.8-3 2.2-2.2 3-0.8 3 0.8 2.2 2.2 0.8 3z"/></svg>';
        emojiTrigger.onclick = function () {
          if (emojiPicker.style.display === "none") {
            emojiPicker.style.display = "block";
          } else if (emojiPicker.style.display === "block") {
            emojiPicker.style.display = "none";
          }
          emojiPicker.focus();
        };

        if (!emojiInput.hasAttribute("data-meteor-emoji-large")) {
          emojiContainer.appendChild(emojiTrigger);
        }

        window.addEventListener('click', function (e) {

          if (!emojiInput.hasAttribute("data-meteor-emoji-large")) {
            if (emojiPicker.style.display === "block") {
              if (emojiPicker.contains(e.target) || emojiTrigger.contains(e.target)) {} else {
                emojiPicker.style.display = "none";
              }
            }
          }
        });

        var facesCategory = document.createElement("ul");
        facesCategory.style.padding = "10px 0px";
        facesCategory.style.margin = "0";
        facesCategory.style.listStyle = "none";
        facesCategory.style.textAlign = "left";
        facesCategory.style.marginLeft = "3%";
        facesCategory.classList.add("faces");

        var animalsCategory = document.createElement("ul");
        animalsCategory.style.padding = "10px 0px";
        animalsCategory.style.margin = "0";
        animalsCategory.style.listStyle = "none";
        animalsCategory.style.textAlign = "left";
        animalsCategory.style.marginLeft = "3%";
        animalsCategory.classList.add("animals");
        animalsCategory.style.display = "none";

        var foodCategory = document.createElement("ul");
        foodCategory.style.padding = "10px 0px";
        foodCategory.style.margin = "0";
        foodCategory.style.listStyle = "none";
        foodCategory.style.textAlign = "left";
        foodCategory.style.marginLeft = "3%";
        foodCategory.classList.add("food");
        foodCategory.style.display = "none";

        var sportCategory = document.createElement("ul");
        sportCategory.style.padding = "10px 0px";
        sportCategory.style.margin = "0";
        sportCategory.style.listStyle = "none";
        sportCategory.style.textAlign = "left";
        sportCategory.style.marginLeft = "3%";
        sportCategory.classList.add("sport");
        sportCategory.style.display = "none";

        var transportCategory = document.createElement("ul");
        transportCategory.style.padding = "10px 0px";
        transportCategory.style.margin = "0";
        transportCategory.style.listStyle = "none";
        transportCategory.style.textAlign = "left";
        transportCategory.style.marginLeft = "3%";
        transportCategory.classList.add("transport");
        transportCategory.style.display = "none";

        var objectsCategory = document.createElement("ul");
        objectsCategory.style.padding = "10px 0px";
        objectsCategory.style.margin = "0";
        objectsCategory.style.listStyle = "none";
        objectsCategory.style.textAlign = "left";
        objectsCategory.style.marginLeft = "3%";
        objectsCategory.classList.add("objects");
        objectsCategory.style.display = "none";

        var emojiCategory = document.createElement("ul");
        emojiCategory.style.padding = "0px";
        emojiCategory.style.margin = "0";
        emojiCategory.style.display = "table";
        emojiCategory.style.width = "100%";
        emojiCategory.style.background = "#eff0f1";
        emojiCategory.style.listStyle = "none";
        emojiCategory.classList.add("category");

        var emojiCategories = new Array();
        emojiCategories.push({ name: 'faces', svg: '<svg id="faces" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 150 150"><path id="faces" d="M74.34,128.48a53.5,53.5,0,1,1,37.84-15.67,53.16,53.16,0,0,1-37.84,15.67Zm0-97.89a44.4,44.4,0,1,0,31.4,13,44.07,44.07,0,0,0-31.4-13Z"/><path id="faces" d="M74.35,108A33.07,33.07,0,0,1,41.29,75a2.28,2.28,0,0,1,2.27-2.28h0A2.27,2.27,0,0,1,45.83,75a28.52,28.52,0,0,0,57,0,2.27,2.27,0,0,1,4.54,0A33.09,33.09,0,0,1,74.35,108Z"/><path id="faces" d="M58.84,62a6.81,6.81,0,1,0,6.81,6.81A6.81,6.81,0,0,0,58.84,62Z"/><path id="faces" d="M89.87,62a6.81,6.81,0,1,0,6.81,6.81A6.82,6.82,0,0,0,89.87,62Z"/></svg>' });
        emojiCategories.push({ name: 'animals', svg: '<svg id="animals" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 150 150"><path id="animals" d="M59.9,91.75h0c-22.46,0-41.82-19.34-44.09-44A52.1,52.1,0,0,1,16,36.8a4.51,4.51,0,0,1,2.63-3.62,39.79,39.79,0,0,1,12.74-3.37c23.92-2.15,45.35,17.83,47.74,43.86a52.77,52.77,0,0,1-.15,10.93,4.56,4.56,0,0,1-2.64,3.62,39.67,39.67,0,0,1-12.73,3.36c-1.23.11-2.45.17-3.66.17ZM24.76,40.49a41.29,41.29,0,0,0,.09,6.4C26.7,67,42.09,82.66,59.9,82.67h0c.94,0,1.88,0,2.83-.14a30.39,30.39,0,0,0,7.41-1.62,41.14,41.14,0,0,0-.11-6.4C68.09,53.38,51.11,37.08,32.17,38.86a30.78,30.78,0,0,0-7.41,1.63Z"/><path id="animals" d="M36.68,125.64a4.53,4.53,0,0,1-4.33-3.17,53.32,53.32,0,0,1-2.26-11A50.42,50.42,0,0,1,39.51,76.6c7.35-9.91,17.84-16,29.5-17,1.16-.11,2.33-.13,3.47-.13a4.54,4.54,0,0,1,4.33,3.16,51.59,51.59,0,0,1,2.27,11.08,50.39,50.39,0,0,1-9.42,34.8c-7.35,9.91-17.83,16-29.5,17a17.63,17.63,0,0,1-3.48.12ZM69.09,68.69A32.41,32.41,0,0,0,46.8,82a42.57,42.57,0,0,0-6.71,34.38,32.38,32.38,0,0,0,22.28-13.32A41.35,41.35,0,0,0,70,74.51a39.38,39.38,0,0,0-.94-5.82Z"/><path id="animals" d="M90.27,91.75c-1.22,0-2.43-.06-3.66-.17a39.67,39.67,0,0,1-12.73-3.36,4.57,4.57,0,0,1-2.64-3.61,53.38,53.38,0,0,1-.17-10.93c2.41-26,23.7-46.07,47.76-43.87a39.74,39.74,0,0,1,12.73,3.37,4.57,4.57,0,0,1,2.64,3.62,53.35,53.35,0,0,1,.16,10.92c-2.28,24.69-21.65,44-44.09,44ZM80,80.91a30.57,30.57,0,0,0,7.42,1.62c19.07,1.78,35.92-14.53,37.87-35.64a42.55,42.55,0,0,0,.1-6.4A30.86,30.86,0,0,0,118,38.86C99,37.07,82.06,53.38,80.12,74.51a43.91,43.91,0,0,0-.1,6.4Z"/><path id="animals" d="M113.49,125.64h0c-1.16,0-2.3,0-3.46-.12-23.9-2.21-41.36-25.47-38.94-51.85A53.52,53.52,0,0,1,73.34,62.6a4.55,4.55,0,0,1,4.33-3.16c1.16,0,2.34,0,3.51.13,11.64,1.07,22.11,7.12,29.48,17a50.51,50.51,0,0,1,9.42,34.81,53.51,53.51,0,0,1-2.26,11,4.54,4.54,0,0,1-4.33,3.19ZM81.08,68.69a42.53,42.53,0,0,0-1,5.82c-1.94,21.1,11.45,39.71,29.95,41.88A42.38,42.38,0,0,0,103.36,82,32.42,32.42,0,0,0,81.08,68.69Z"/><path id="animals" d="M75.08,45.45a7.83,7.83,0,1,0,7.83,7.83,7.83,7.83,0,0,0-7.83-7.83Z"/><path id="animals" d="M76.29,51.89a2.26,2.26,0,0,1-2.14-3A46,46,0,0,1,92.82,25.34a2.27,2.27,0,1,1,2.4,3.86A41.4,41.4,0,0,0,78.43,50.39a2.28,2.28,0,0,1-2.14,1.5Z"/><path id="animals" d="M73.87,51.89a2.28,2.28,0,0,1-2.14-1.5A41.35,41.35,0,0,0,54.94,29.2a2.27,2.27,0,0,1,2.39-3.86A46,46,0,0,1,76,48.85a2.28,2.28,0,0,1-1.37,2.91,2.31,2.31,0,0,1-.77.13Z"/></svg>' });
        emojiCategories.push({ name: 'food', svg: '<svg id="food" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 150 150"><path id="food" d="M104,20.76h.15c15.83.52,24.08,21.48,24.07,32.56.26,12.42-10.72,23.55-24,24.21a3.53,3.53,0,0,1-.46,0c-13.25-.66-24.23-11.8-24-24.3,0-11,8.26-31.95,24.07-32.47Zm0,47.69c8.25-.54,15.3-7.51,15.14-15,0-8.12-6.22-23.1-15.14-23.57-8.9.46-15.14,15.45-15.14,23.48-.14,7.61,6.9,14.59,15.14,15.13Z"/><path id="food" d="M97.19,69.21h.14a4.53,4.53,0,0,1,4.4,4.68l-1.48,46.92a1.59,1.59,0,0,0,.5,1.06,4.6,4.6,0,0,0,3.25,1.19h0a4.57,4.57,0,0,0,3.26-1.2,1.53,1.53,0,0,0,.49-1l-1.48-46.95a4.54,4.54,0,1,1,9.08-.28l1.47,46.91a10.42,10.42,0,0,1-3,7.65,13.65,13.65,0,0,1-9.81,4h0a13.58,13.58,0,0,1-9.79-4,10.42,10.42,0,0,1-3-7.67l1.48-46.89a4.53,4.53,0,0,1,4.53-4.4Z"/><path id="food" d="M41.84,69.21H42a4.53,4.53,0,0,1,4.4,4.68L44.9,120.81a1.57,1.57,0,0,0,.5,1.06,4.6,4.6,0,0,0,3.25,1.19h0a4.51,4.51,0,0,0,3.24-1.19,1.48,1.48,0,0,0,.5-1L50.93,73.89a4.53,4.53,0,0,1,4.39-4.68A4.4,4.4,0,0,1,60,73.61l1.48,46.91a10.49,10.49,0,0,1-3,7.66,13.57,13.57,0,0,1-9.78,4h0a13.59,13.59,0,0,1-9.78-4,10.48,10.48,0,0,1-3-7.67l1.48-46.9a4.54,4.54,0,0,1,4.54-4.4Z"/><path id="food" d="M28.59,20.76a4.54,4.54,0,0,1,4.54,4.54V51a15.52,15.52,0,0,0,31,0V25.3a4.55,4.55,0,0,1,9.09,0V51a24.61,24.61,0,1,1-49.21,0V25.3a4.54,4.54,0,0,1,4.54-4.54Z"/><path id="food" d="M55.34,20.76a4.54,4.54,0,0,1,4.54,4.54v19a4.54,4.54,0,1,1-9.08,0v-19a4.54,4.54,0,0,1,4.54-4.54Z"/><path id="food" d="M42,20.76a4.54,4.54,0,0,1,4.54,4.54v19a4.54,4.54,0,1,1-9.08,0v-19A4.54,4.54,0,0,1,42,20.76Z"/></svg>' });
        emojiCategories.push({ name: 'sport', svg: '<svg id="sport" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 150 150"><path id="sport" d="M75.35,130.24a53.49,53.49,0,1,1,53.48-53.49,53.55,53.55,0,0,1-53.48,53.49Zm0-97.89a44.41,44.41,0,1,0,44.4,44.4,44.1,44.1,0,0,0-44.4-44.4Z"/><path id="sport" d="M119.24,84.08A51.29,51.29,0,0,1,68,32.86a49.44,49.44,0,0,1,.26-5,2.26,2.26,0,0,1,2-2c1.66-.16,3.34-.25,5-.25a51.26,51.26,0,0,1,51.21,51.21c0,1.71-.09,3.38-.25,5a2.28,2.28,0,0,1-2,2c-1.65.16-3.33.25-5,.25ZM72.64,30.16c-.06.9-.08,1.79-.08,2.7a46.73,46.73,0,0,0,46.68,46.68q1.37,0,2.7-.09c.06-.89.08-1.79.08-2.7A46.72,46.72,0,0,0,75.35,30.08c-.91,0-1.82,0-2.71.08Z"/><path id="sport" d="M75.35,128A51.28,51.28,0,0,1,24.12,76.76c0-1.7.1-3.38.25-5a2.29,2.29,0,0,1,2-2c1.66-.16,3.33-.25,5.05-.25a51.27,51.27,0,0,1,51.21,51.22c0,1.69-.09,3.37-.25,5a2.27,2.27,0,0,1-2,2c-1.66.16-3.32.25-5,.25ZM28.75,74.05c-.05.9-.09,1.8-.09,2.71a46.74,46.74,0,0,0,46.69,46.67c.91,0,1.8,0,2.7-.08,0-.9.08-1.8.08-2.7A46.73,46.73,0,0,0,31.46,74c-.91,0-1.81,0-2.71.08Z"/><polygon id="sport" points="42.69 112.61 39.48 109.4 108 40.88 111.21 44.1 42.69 112.61 42.69 112.61"/></svg>' });
        emojiCategories.push({ name: 'transport', svg: '<svg id="transport" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 150 150"><path id="transport" d="M120.7,116H31a4.55,4.55,0,0,1-4.54-4.55V54.28A31.82,31.82,0,0,1,58.25,22.49h35.2a31.83,31.83,0,0,1,31.8,31.79v57.15A4.55,4.55,0,0,1,120.7,116Zm-85.16-9.09h80.62V54.28A22.74,22.74,0,0,0,93.45,31.57H58.25A22.74,22.74,0,0,0,35.54,54.28v52.61Z"/><path id="transport" d="M49.35,129.23c-8.53,0-13.62-2.77-13.62-7.41V115.6a4.54,4.54,0,1,1,9.08,0v4.06a21.32,21.32,0,0,0,9.09,0V115.6a4.54,4.54,0,0,1,9.08,0v6.22c0,4.64-5.09,7.41-13.63,7.41Z"/><path id="transport" d="M102.34,129.23c-8.53,0-13.62-2.77-13.62-7.41V115.6a4.54,4.54,0,0,1,9.08,0v4.06a21.28,21.28,0,0,0,9.08,0V115.6a4.55,4.55,0,0,1,9.09,0v6.22c0,4.64-5.09,7.41-13.63,7.41Z"/><path id="transport" d="M97.81,44.83H53.9a4.55,4.55,0,1,1,0-9.09H97.81a4.55,4.55,0,0,1,0,9.09Z"/><path id="transport" d="M54.28,84.2A6.8,6.8,0,1,0,61.07,91a6.8,6.8,0,0,0-6.79-6.8Z"/><path id="transport" d="M97.43,84.2a6.8,6.8,0,1,0,6.79,6.8,6.8,6.8,0,0,0-6.79-6.8Z"/><path id="transport" d="M107.08,81H44.63a6.82,6.82,0,0,1-6.82-6.82V54.28a6.82,6.82,0,0,1,6.82-6.81h62.45a6.82,6.82,0,0,1,6.81,6.81V74.15A6.83,6.83,0,0,1,107.08,81ZM44.63,52a2.28,2.28,0,0,0-2.28,2.27V74.15a2.28,2.28,0,0,0,2.28,2.27h62.45a2.27,2.27,0,0,0,2.27-2.27V54.28A2.27,2.27,0,0,0,107.08,52Z"/></svg>' });
        emojiCategories.push({ name: 'objects', svg: '<svg id="objects" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 150 150"><path id="objects" d="M107.78,129a4.55,4.55,0,0,1-2.67-.87l-30-21.79-30,21.79a4.53,4.53,0,0,1-5.34,0,4.58,4.58,0,0,1-1.65-5.08L49.59,87.82,19.6,66a4.54,4.54,0,0,1,2.67-8.22H59.34L70.8,22.55a4.55,4.55,0,0,1,8.64,0L90.89,57.81H128A4.54,4.54,0,0,1,130.63,66l-30,21.79,11.46,35.25a4.55,4.55,0,0,1-4.32,6ZM75.12,96.2a4.53,4.53,0,0,1,2.67.87l21.35,15.51L91,87.49a4.55,4.55,0,0,1,1.65-5.08L114,66.89H87.59a4.54,4.54,0,0,1-4.32-3.13l-8.15-25.1L67,63.76a4.53,4.53,0,0,1-4.32,3.13H36.25L57.61,82.41a4.54,4.54,0,0,1,1.65,5.08l-8.17,25.09L72.45,97.07a4.53,4.53,0,0,1,2.67-.87Z"/></svg>' });

        var faces = [0x1F601, 0x1F602, 0x1F603, 0x1F604, 0x1F605, 0x1F606, 0x1F609, 0x1F60A, 0x1F60B, 0x1F60C, 0x1F60D, 0x1F60F, 0x1F612, 0x1F613, 0x1F614, 0x1F616, 0x1F618, 0x1F61A, 0x1F61C, 0x1F61D, 0x1F61E, 0x1F620, 0x1F621, 0x1F622, 0x1F623, 0x1F624, 0x1F625, 0x1F628, 0x1F629, 0x1F62A, 0x1F62B, 0x1F62D, 0x1F630, 0x1F631, 0x1F632, 0x1F633, 0x1F635, 0x1F637];

        var animals = [0x1F40C, 0x1F40D, 0x1F40E, 0x1F411, 0x1F412, 0x1F414, 0x1F417, 0x1F418, 0x1F419, 0x1F41A, 0x1F41B, 0x1F41C, 0x1F41D, 0x1F41E, 0x1F41F, 0x1F420, 0x1F421, 0x1F422, 0x1F423, 0x1F424, 0x1F425, 0x1F426, 0x1F427, 0x1F428, 0x1F429, 0x1F42B, 0x1F42C, 0x1F42D, 0x1F42E, 0x1F42F, 0x1F430, 0x1F431, 0x1F432, 0x1F433, 0x1F434, 0x1F435, 0x1F436, 0x1F437, 0x1F438, 0x1F439, 0x1F43A, 0x1F43B, 0x1F43C];

        var food = [0x1F345, 0x1F346, 0x1F347, 0x1F348, 0x1F349, 0x1F34A, 0x1F34C, 0x1F34D, 0x1F34E, 0x1F34F, 0x1F351, 0x1F352, 0x1F353, 0x1F354, 0x1F355, 0x1F356, 0x1F357, 0x1F358, 0x1F35C, 0x1F35D, 0x1F35E, 0x1F35F, 0x1F360, 0x1F361, 0x1F362, 0x1F363, 0x1F364, 0x1F366, 0x1F368, 0x1F369, 0x1F36A, 0x1F36B, 0x1F36C, 0x1F36D, 0x1F370, 0x1F372, 0x1F373, 0x1F374, 0x1F377, 0x1F378, 0x1F37B];

        var sport = [0x1F3B1, 0x1F3B3, 0x1F3BE, 0x1F3BF, 0x1F3C0, 0x1F3C1, 0x1F3C2, 0x1F3C3, 0x1F3C4, 0x1F3C6, 0x1F3C8, 0x1F3CA, 0x1F6A3, 0X1F6B4, 0X1F6B5, 0X26BD, 0x26BE, 0x26FA, 0x1F3A3, 0x1F3AF, 0x26F3];

        var transport = [0x1F681, 0x1F682, 0x1F686, 0x1F688, 0x1F68A, 0x1F68D, 0x1F68E, 0x1F690, 0x1F694, 0x1F696, 0x1F698, 0x1F69B, 0x1F69C, 0x1F69D, 0x1F69E, 0x1F69F, 0x1F6A0, 0x1F6A1, 0x1F680, 0x1F683, 0x1F684, 0x1F685, 0x1F687, 0x1F689, 0x1F68C, 0x1F691, 0x1F692, 0x1F693, 0x1F695, 0x1F697, 0x1F699, 0x1F69A, 0x1F6A2, 0x1F6A4, 0x1F6B2];

        var objects = [0x1F392, 0x1F388, 0x1F389, 0x1F38F, 0x1F393, 0x1F3A1, 0x1F3A2, 0x1F3A4, 0x1F3A5, 0x1F3A7, 0x1F3A8, 0x1F3AB, 0x1F3AC, 0x1F3AE, 0x1F3AF, 0x1F3B6, 0x1F3B7, 0x1F3B8, 0x1F3B9, 0x1F3BA, 0x1F3BB, 0x1F3BC, 0x1F3E0, 0x1F3E5, 0x1F3EA, 0x1F493, 0x1F494, 0x1F495, 0x1F496, 0x1F497, 0x1F498, 0x1F4BB, 0x1F4BA, 0x1F4C5, 0x1F4D5, 0x1F4F7];

        emojiCategories.map(function (item) {
          var emojiLink = document.createElement("a");
          emojiLink.style.textDecoration = "none";
          emojiLink.style.padding = "5px";
          emojiLink.style.position = "initial";
          emojiLink.style.fontSize = "24px";
          emojiLink.setAttribute("href", "javascript:void(0)");
          emojiLink.style.display = "table-cell";
          emojiLink.style.textAlign = "center";
          emojiLink.id = String(item['name']);

          if (String(item["name"]) == "faces") {
            emojiLink.style.background = "#c2c2c2";
          }
          emojiLink.innerHTML = String(item['svg']);

          emojiLink.onmousedown = clickCategory;

          emojiCategory.appendChild(emojiLink);
        });

        faces.map(function (item) {
          var emojiLink = document.createElement("a");
          emojiLink.style.textDecoration = "none";
          emojiLink.style.margin = "5px";
          emojiLink.style.position = "initial";
          emojiLink.style.fontSize = "24px";
          emojiLink.setAttribute("href", "javascript:void(0)");
          emojiLink.innerHTML = String.fromCodePoint(item);
          emojiLink.onmousedown = clickLink;

          facesCategory.appendChild(emojiLink);
        });

        animals.map(function (item) {
          var emojiLink = document.createElement("a");
          emojiLink.style.textDecoration = "none";
          emojiLink.style.margin = "5px";
          emojiLink.style.position = "initial";
          emojiLink.style.fontSize = "24px";
          emojiLink.setAttribute("href", "javascript:void(0)");
          emojiLink.innerHTML = String.fromCodePoint(item);
          emojiLink.onmousedown = clickLink;

          animalsCategory.appendChild(emojiLink);
        });

        food.map(function (item) {
          var emojiLink = document.createElement("a");
          emojiLink.style.textDecoration = "none";
          emojiLink.style.margin = "5px";
          emojiLink.style.position = "initial";
          emojiLink.style.fontSize = "24px";
          emojiLink.setAttribute("href", "javascript:void(0)");
          emojiLink.innerHTML = String.fromCodePoint(item);
          emojiLink.onmousedown = clickLink;

          foodCategory.appendChild(emojiLink);
        });

        sport.map(function (item) {
          var emojiLink = document.createElement("a");
          emojiLink.style.textDecoration = "none";
          emojiLink.style.margin = "5px";
          emojiLink.style.position = "initial";
          emojiLink.style.fontSize = "24px";
          emojiLink.setAttribute("href", "javascript:void(0)");
          emojiLink.innerHTML = String.fromCodePoint(item);
          emojiLink.onmousedown = clickLink;

          sportCategory.appendChild(emojiLink);
        });

        transport.map(function (item) {
          var emojiLink = document.createElement("a");
          emojiLink.style.textDecoration = "none";
          emojiLink.style.margin = "5px";
          emojiLink.style.position = "initial";
          emojiLink.style.fontSize = "24px";
          emojiLink.setAttribute("href", "javascript:void(0)");
          emojiLink.innerHTML = String.fromCodePoint(item);
          emojiLink.onmousedown = clickLink;

          transportCategory.appendChild(emojiLink);
        });

        objects.map(function (item) {
          var emojiLi = document.createElement("li");
          emojiLi.style.display = "inline-block";
          emojiLi.style.margin = "5px";

          var emojiLink = document.createElement("a");
          emojiLink.style.textDecoration = "none";
          emojiLink.style.margin = "5px";
          emojiLink.style.position = "initial";
          emojiLink.style.fontSize = "24px";
          emojiLink.setAttribute("href", "javascript:void(0)");
          emojiLink.innerHTML = String.fromCodePoint(item);
          emojiLink.onmousedown = clickLink;

          objectsCategory.appendChild(emojiLink);
        });

        emojiPicker.appendChild(emojiCategory);
        emojiPicker.appendChild(facesCategory);
        emojiPicker.appendChild(animalsCategory);
        emojiPicker.appendChild(foodCategory);
        emojiPicker.appendChild(sportCategory);
        emojiPicker.appendChild(transportCategory);
        emojiPicker.appendChild(objectsCategory);
        emojiContainer.appendChild(emojiPicker);
      }
    }]);

    return MeteorEmoji;
  }();

  module.exports = MeteorEmoji;
});

},{}]},{},[1])(1)
});
