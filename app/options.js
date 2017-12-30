$(function() {

    // add localization i18n items
    var deepLTViewAlternativeTranslations = browser.i18n.getMessage('deepLTViewAlternativeTranslations');
    var deepLTViewAlternativeTranslationsOption1 = browser.i18n.getMessage('deepLTViewAlternativeTranslationsOption1');
    var deepLTViewAlternativeTranslationsOption2 = browser.i18n.getMessage('deepLTViewAlternativeTranslationsOption2');
    var deepLTViewAlternativeTranslationsOption3 = browser.i18n.getMessage('deepLTViewAlternativeTranslationsOption3');
    var deepLTMemorizeLanguageSelection = browser.i18n.getMessage('deepLTMemorizeLanguageSelection');
    var deepLTMemorizeLanguageSelectionOption1 = browser.i18n.getMessage('deepLTMemorizeLanguageSelectionOption1');
    var deepLTMemorizeLanguageSelectionOption2 = browser.i18n.getMessage('deepLTMemorizeLanguageSelectionOption2');

    $('#label-param1').html(deepLTViewAlternativeTranslations);
    $('#type-none').after(deepLTViewAlternativeTranslationsOption1);
    $('#type-together').after(deepLTViewAlternativeTranslationsOption2);
    $('#type-split').after(deepLTViewAlternativeTranslationsOption3);
    $('#label-param2').html(deepLTMemorizeLanguageSelection);
    $('#memo-always').after(deepLTMemorizeLanguageSelectionOption1);
    $('#memo-never').after(deepLTMemorizeLanguageSelectionOption2);

    // view alternative translations
    browser.storage.local.get('typeTrad').then(function(item){
    	if (item.typeTrad === undefined || item.typeTrad === '0') {
    		document.querySelector('#type-none').checked = true;
    	} else if (item.typeTrad === '1') {
    		document.querySelector('#type-together').checked = true;
    	} else if (item.typeTrad === '2') {
    		document.querySelector('#type-split').checked = true;
    	}
    });

    var typeTrad_options = document.querySelectorAll('#type-none, #type-together, #type-split');
    for (i = 0; i < typeTrad_options.length; i++) {
    	typeTrad_options[i].onchange = function(e) {
    		browser.storage.local.set({ typeTrad: this.value });
    	}
    }

    // memorize language selection
    browser.storage.local.get('memoLang').then(function(item){
    	if (item.memoLang === undefined || item.memoLang === '0') {
    		document.querySelector('#memo-never').checked = true;
    	} else if (item.memoLang === '1') {
    		document.querySelector('#memo-always').checked = true;
    	}
    });

    var memoLang_options = document.querySelectorAll('#memo-never, #memo-always');
    for (i = 0; i < memoLang_options.length; i++) {
    	memoLang_options[i].onchange = function(e) {
    		browser.storage.local.set({ memoLang: this.value });
    	}
    }

});
