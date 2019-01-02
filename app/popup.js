$(function() {

    // update version app
    var manifest = chrome.runtime.getManifest();
    $('.version').html(manifest.version);

    // add event to open DeepL website
    $('.deepl img').on('click', function(){
        browser.tabs.create({
            url: 'https://www.deepl.com/translator'
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

    // get local storage items
    browser.storage.local.get(['sessionDate', 'langOrigin', 'langTarget', 'memoLang', 'typeTrad']).then(function(item) {

        // get lang from UI
        var langUI = browser.i18n.getUILanguage().toUpperCase();
        var langArray = ['FR', 'EN', 'DE', 'ES', 'IT', 'NL', 'PL'];
        if ($.inArray(langUI, langArray) < 0) {
            langUI = 'EN';
        }

        var tmpSessionDate = item.sessionDate;
        var tmpLangOrigin = item.langOrigin;
        var tmpLangTarget = item.langTarget;
        var tmpMemoLang = item.memoLang;
        var tmpTypeTrad = item.typeTrad;

        if ((tmpMemoLang >= 0) == false) {
            tmpMemoLang = 0;
            browser.storage.local.set({ memoLang: 0 });
        }

        if ((tmpTypeTrad >= 0) == false) {
            tmpTypeTrad = 0;
            browser.storage.local.set({ typeTrad: 0 });
        }

        // management of alternative text display
        if (tmpTypeTrad == 1) {
            $('.simple-result').addClass('d-none').removeClass('d-block');
            $('.carousel-result').addClass('d-block').removeClass('d-none');
            $('.list-result').addClass('d-none').removeClass('d-block');
        } else if (tmpTypeTrad == 2) {
            $('.simple-result').addClass('d-none').removeClass('d-block');
            $('.carousel-result').addClass('d-none').removeClass('d-block');
            $('.list-result').addClass('d-block').removeClass('d-none');
        } else {
            $('.simple-result').addClass('d-block').removeClass('d-none');
            $('.carousel-result').addClass('d-none').removeClass('d-block');
            $('.list-result').addClass('d-none').removeClass('d-block');
        }

        // session control
        if ((tmpSessionDate != undefined) && (tmpSessionDate != '') && (tmpMemoLang == 1)) {

            var newDate = new Date();
            var seconds = (newDate.getTime() - tmpSessionDate.getTime()) / 1000;

            // if session too old, create new one (10  minutes)
            if (seconds > 4) {
                browser.storage.local.set({ langOrigin: 'auto' });
                browser.storage.local.set({ langTarget: langUI });
                $('#lang-origin').val('auto');
                $('#lang-target').val(langUI);

                tmpLangOrigin = $('#lang-origin').val();
                tmpLangTarget = $('#lang-target').val();
            } else {
                $('#lang-origin').val(tmpLangOrigin);
                $('#lang-target').val(tmpLangTarget);
            }

        } else {
            browser.storage.local.set({ langOrigin: 'auto' });
            browser.storage.local.set({ langTarget: langUI });
            $('#lang-origin').val('auto');
            $('#lang-target').val(langUI);

            tmpLangOrigin = $('#lang-origin').val();
            tmpLangTarget = $('#lang-target').val();
        }

        // add or update session date
        browser.storage.local.set({ sessionDate: new Date() });

        // add event translation system
        var callID = 0;

        var delay = (function(){
            var timer = 0;
            return function(callback, ms){
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            };
        })();

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

        // add event to switch lang
        $('.arrow i').on('click', function(){
            var tmpOrigin = $('#lang-origin').val();
            var tmpTarget = $('#lang-target').val();
            if (tmpOrigin != 'auto') {
                $('#lang-origin').val(tmpTarget);
                $('#lang-target').val(tmpOrigin);
            } else {
                $('#lang-origin').val(tmpTarget);
                if (tmpTarget != langUI) {
                    $('#lang-target').val(langUI);
                } else {
                    $('#lang-target').val('EN');
                }
            }
            browser.storage.local.set({ langOrigin: tmpTarget });
            browser.storage.local.set({ langTarget: tmpOrigin });
            browser.storage.local.set({ sessionDate: new Date() });
        });

        $('#trad-search, #lang-origin, #lang-target').on('keyup change', function() {

            var text = $('#trad-search').val().trim();
            var tmpTimestamp = Date.now();
            tmpLangOrigin = $('#lang-origin').val();
            tmpLangTarget = $('#lang-target').val();
            var request = JSON.stringify({
                jsonrpc: '2.0',
                method: 'LMT_handle_jobs',
                params: {
                    jobs: [{
                        kind: 'default',
                        quality: 'fast',
                        raw_en_sentence: text
                    }],
                    lang: {
                        user_preferred_langs: [langUI,'EN'],
                        source_lang_user_selected: tmpLangOrigin,
                        target_lang: tmpLangTarget
                    },
                    priority: -1,
                    timestamp: tmpTimestamp
                },
                id: callID
            });

    		if (text.length < 2) {
                $('.bar').removeClass('bar-loading');
    			$('#simple-result', '#carousel-result-0, #carousel-result-1, #carousel-result-2, #carousel-result-3', '#list-result-0, #list-result-1, #list-result-2, #list-result-3').val('');
    		}
    		else {
                $('.bar').addClass('bar-loading');
                delay(function(){
                    callID++;
        			$.ajax({
        				url: 'https://www2.deepl.com/jsonrpc',
        				contentType: 'application/json',
        				type: 'POST',
        				data: request,
                        dataType: 'json',
        				success: function(response) {
                            text = $('#trad-search').val().trim();
                            $('.bar').removeClass('bar-loading');
                            if (text.length > 1) {
                                $('#simple-result').html(response.result.translations[0].beams[0].postprocessed_sentence);
            					$('#carousel-result-0').html(response.result.translations[0].beams[0].postprocessed_sentence);
                                $('#list-result-0').html(response.result.translations[0].beams[0].postprocessed_sentence);

                                if(response.result.translations[0].beams[1] != undefined) {
                                    $('#carousel-result-1').html(response.result.translations[0].beams[1].postprocessed_sentence);
                                    $('#list-result-1').html(response.result.translations[0].beams[1].postprocessed_sentence);
                                }

                                if(response.result.translations[0].beams[2] != undefined) {
                                    $('#carousel-result-2').html(response.result.translations[0].beams[2].postprocessed_sentence);
                                    $('#list-result-2').html(response.result.translations[0].beams[2].postprocessed_sentence);
                                }

                                if(response.result.translations[0].beams[3] != undefined) {
                                    $('#carousel-result-3').html(response.result.translations[0].beams[3].postprocessed_sentence);
                                    $('#list-result-3').html(response.result.translations[0].beams[3].postprocessed_sentence);
                                }
                            } else {
                                $('#simple-result').html('');

            					$('#carousel-result-0').html('');
                                $('#carousel-result-1').html('');
                                $('#carousel-result-2').html('');
                                $('#carousel-result-3').html('');

                                $('#list-result-0').html('');
                                $('#list-result-1').html('');
                                $('#list-result-2').html('');
                                $('#list-result-3').html('');
                            }
        				},
        				error:function(xhr,status,error) {
                            $('.bar').removeClass('bar-loading');
                            $('#simple-result', '#carousel-result-0, #carousel-result-1, #carousel-result-2, #carousel-result-3', '#list-result-0, #list-result-1, #list-result-2, #list-result-3').html(error);
        				}
        			});
                }, 1000);
    		}
        });

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
    $('.deepl img').attr('alt', name);
    // localizaton and focus on field
    $('#trad-search').attr('placeholder', textToBeTranslated).attr('aria-label', textToBeTranslated).focus();

});
