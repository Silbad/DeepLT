$(function() {
    $('#trad-search').on('keyup', function() {
        var text = $(this).val().trim();
		if (text == '') {
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
							source_lang_user_selected: 'FR',
							target_lang: 'EN'
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