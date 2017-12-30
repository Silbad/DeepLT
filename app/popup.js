$(function() {

    // get lang from UI
    var langUI = browser.i18n.getUILanguage().toUpperCase();

    // session control
    let getSessionDate = browser.storage.local.get('sessionDate');
    if ((getSessionDate != undefined) && (getSessionDate != '') && (getSessionDate != null)) {
        getSessionDate.then(function(date) {
            var originDate = date.sessionDate;
            var newDate = new Date();
            var seconds = (newDate.getTime() - originDate.getTime()) / 1000;
            if (seconds > 18000) {
                browser.storage.local.remove('langOrigin');
                browser.storage.local.remove('langTarget');
            }
        });
    } else {
        browser.storage.local.set({ sessionDate: new Date() });
    }

    // manage selected languages
    var lang_origin = '';
    var lang_target = '';

    browser.storage.local.get('memoLang').then(function(item){
        if (item.memoLang === undefined || item.memoLang === '0') {
            lang_origin = $('#lang-origin').val();
            lang_target = $('#lang-target').val();
        } else if (item.memoLang === '1') {
            let getLangOrigin = browser.storage.local.get('langOrigin');
            if ((getLangOrigin != undefined) && (getLangOrigin != '') && (getLangOrigin != null)) {
                getLangOrigin.then(function(item2) {
                    if (item2.langOrigin != undefined) {
                        $('#lang-origin').val(item2.langOrigin);
                    }
                    lang_origin = item2.langOrigin;
                });
            }
            let getLangTarget = browser.storage.local.get('langTarget');
            if ((getLangTarget != undefined) && (getLangTarget != '') && (getLangTarget != null)) {
                getLangTarget.then(function(item3) {
                    if (item3.langTarget != undefined) {
                        $('#lang-target').val(item3.langTarget);
                    }
                    lang_target = item3.langTarget;
                });
            }
        }
    });

    // add localization i18n items
    var name = browser.i18n.getMessage('deepLTName');
    var description = browser.i18n.getMessage('deepLTDescription');
    var auto = browser.i18n.getMessage('deepLTAuto');
    var french = browser.i18n.getMessage('deepLTFrench');
    var english = browser.i18n.getMessage('deepLTEnglish');
    var german = browser.i18n.getMessage('deepLTGerman');
    var spanish = browser.i18n.getMessage('deepLTSpanish');
    var italian = browser.i18n.getMessage('deepLTItalian');
    var dutch = browser.i18n.getMessage('deepLTDutch');
    var polish = browser.i18n.getMessage('deepLTPolish');
    var textToBeTranslated = browser.i18n.getMessage('deepLTTextToBeTranslated');

    $('#lang-origin option[value="auto"]').html(auto);
    $('#lang-origin option[value="FR"], #lang-target option[value="FR"]').html(french);
    $('#lang-origin option[value="EN"], #lang-target option[value="EN"]').html(english);
    $('#lang-origin option[value="DE"], #lang-target option[value="DE"]').html(german);
    $('#lang-origin option[value="ES"], #lang-target option[value="ES"]').html(spanish);
    $('#lang-origin option[value="IT"], #lang-target option[value="IT"]').html(italian);
    $('#lang-origin option[value="NL"], #lang-target option[value="NL"]').html(dutch);
    $('#lang-origin option[value="PL"], #lang-target option[value="PL"]').html(polish);
    $('#trad-search').attr('placeholder', textToBeTranslated).attr('aria-label', textToBeTranslated);
    $('.deepl img').attr('alt', name);

    var manifest = chrome.runtime.getManifest();
    $('.version').html(manifest.version);

    // add event to memorize selected languages
    $('#lang-origin').on('change', function() {
        var tmpVal = $(this).val();
        browser.storage.local.set({ langOrigin: tmpVal });
        browser.storage.local.set({ sessionDate: new Date() });
    });

    $('#lang-target').on('change', function() {
        var tmpVal = $(this).val();
        browser.storage.local.set({ langTarget: tmpVal });
        browser.storage.local.set({ sessionDate: new Date() });
    });

    // add event to open DeepL website
    $('.deepl img').on('click', function(){
        browser.tabs.create({
            url: 'https://www.deepl.com/'
        });
    });

    // add event to open GitHub repository
    $('.params .fa-github').on('click', function(){
        browser.tabs.create({
            url: 'https://github.com/Silbad/DeepLT'
        });
    });

    // add event to open params
    $('.params .fa-cog').on('click', function(){
        browser.runtime.openOptionsPage()
    });

    // add event translation system
    var callID = 0;

    $('#trad-search, #lang-origin, #lang-target').on('keyup change', function() {

        callID++;
        var text = $('#trad-search').val().trim();

        browser.storage.local.get('memoLang').then(function(item){
            if (item.memoLang === undefined || item.memoLang === '0') {
                lang_origin = $('#lang-origin').val();
                lang_target = $('#lang-target').val();
            } else if (item.memoLang === '1') {
                let getLangOrigin = browser.storage.local.get('langOrigin');
                if ((getLangOrigin != undefined) && (getLangOrigin != '') && (getLangOrigin != null)) {
                    getLangOrigin.then(function(item2){
                        lang_origin = item2.langOrigin;
                    });
                }
                let getLangTarget = browser.storage.local.get('langTarget');
                if ((getLangTarget != undefined) && (getLangTarget != '') && (getLangTarget != null)) {
                    getLangTarget.then(function(item3){
                        lang_target = item3.langTarget;
                    });
                }
            }
        });

		if (text.length < 3) {
			$('#simple-result', '#carousel-result-0, #carousel-result-1, #carousel-result-2, #carousel-result-3', '#list-result-0, #list-result-1, #list-result-2, #list-result-3').val('');
		}
		else {
			$.ajax({
				url: 'https://www.deepl.com/jsonrpc',
				contentType: 'text/plain',
				crossDomain: true,
				type: 'POST',
				dataType: "json",
				data: JSON.stringify({
					jsonrpc: '2.0',
					method: 'LMT_handle_jobs',
					params: {
						jobs: [{
							kind: 'default',
							raw_en_sentence: text
						}],
						lang: {
							user_preferred_langs: [langUI,'EN'],
							source_lang_user_selected: lang_origin,
							target_lang: lang_target
						},
						priority: -1
					},
					id: callID
				}),
				success: function(response) {
                    $('#simple-result').html(response.result.translations[0].beams[0].postprocessed_sentence);

					$('#carousel-result-0').html(response.result.translations[0].beams[0].postprocessed_sentence);
                    $('#carousel-result-1').html(response.result.translations[0].beams[1].postprocessed_sentence);
                    $('#carousel-result-2').html(response.result.translations[0].beams[2].postprocessed_sentence);
                    $('#carousel-result-3').html(response.result.translations[0].beams[3].postprocessed_sentence);

                    $('#list-result-0').html(response.result.translations[0].beams[0].postprocessed_sentence);
                    $('#list-result-1').html(response.result.translations[0].beams[1].postprocessed_sentence);
                    $('#list-result-2').html(response.result.translations[0].beams[2].postprocessed_sentence);
                    $('#list-result-3').html(response.result.translations[0].beams[3].postprocessed_sentence);
				},
				error:function(xhr,status,error){
                    alert(x.status);
                    $('#simple-result', '#carousel-result-0, #carousel-result-1, #carousel-result-2, #carousel-result-3', '#list-result-0, #list-result-1, #list-result-2, #list-result-3').html(error);
				}
			});
		}
    });

    // management of alternative text display
    browser.storage.local.get('typeTrad').then(function(item){
    	if (item.typeTrad === undefined || item.typeTrad === '0') {
            $('.simple-result').addClass('d-block').removeClass('d-none');
            $('.carousel-result').addClass('d-none').removeClass('d-block');
            $('.list-result').addClass('d-none').removeClass('d-block');
    	} else if (item.typeTrad === '1') {
            $('.simple-result').addClass('d-none').removeClass('d-block');
            $('.carousel-result').addClass('d-block').removeClass('d-none');
            $('.list-result').addClass('d-none').removeClass('d-block');
    	} else if (item.typeTrad === '2') {
            $('.simple-result').addClass('d-none').removeClass('d-block');
            $('.carousel-result').addClass('d-none').removeClass('d-block');
            $('.list-result').addClass('d-block').removeClass('d-none');
    	}
    });

});
