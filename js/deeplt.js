$(function() {
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

    // add event translation system
    $('#trad-search, #lang-origin, #lang-target').on('keyup change', function() {

        var text = $('#trad-search').val().trim();
        var lang_origin = $('#lang-origin').val();
        var lang_target = $('#lang-target').val();

		if (text.length < 3) {
			$('#trad-result').val('');
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
							user_preferred_langs: ['FR','EN'],
							source_lang_user_selected: lang_origin,
							target_lang: lang_target
						},
						priority: -1
					},
					id: '9'
				}),
				success: function(response) {
					$('#trad-result').val(response.result.translations[0].beams[0].postprocessed_sentence);
				},
				error:function(xhr,status,error){
					console.log(xhr,status,error);
				}
			});
		}
    });
});
