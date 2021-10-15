<script lang="ts">
  import Heroicon from '@martinse/svelte-heroicons';
  import { switchHorizontal as solidSwitchHorizontal } from '@martinse/svelte-heroicons/dist/solid';
  import axios from 'axios';

  const langs = require('../../assets/json/langs.json');

  const i18n = {
    something: browser.i18n.getMessage('something'),
    on: browser.i18n.getMessage('on'),
    with: browser.i18n.getMessage('with'),
    locale: browser.i18n,
    congratulations: browser.i18n.getMessage('congratulations'),
    congratulations_copy_translation: browser.i18n.getMessage('congratulations_copy_translation'),
    error: browser.i18n.getMessage('error'),
    error_limit_consumption: browser.i18n.getMessage('error_limit_consumption'),
  };

  let sourceLang = browser.i18n.getUILanguage().toUpperCase();
  let targetLang = sourceLang === 'EN' ? 'FR' : 'EN';
  let formDisabled = false;
  let selectionText = '';
  let translation = '';
  let config = {};

  (async () => {
    // get text selection from storage and remove storage
    await browser.storage.local.get('selectionText').then((value) => {
      selectionText = '';
      if (value.selectionText !== undefined) {
        selectionText = value.selectionText;
        browser.storage.local.remove('selectionText');
      }
    });

    let dataLocale = {};
    let dataSync = {};

    // get optionsDeepLT
    await browser.storage.local.get('optionsDeepLT').then((value) => {
      dataLocale = value.optionsDeepLT;
    });
    await browser.storage.sync.get('optionsDeepLT').then((value) => {
      dataSync = value.optionsDeepLT;
    });
    config = dataLocale !== undefined ? dataLocale : dataSync;
    if (config === undefined) {
      browser.runtime.openOptionsPage().then(function () {
        browser.runtime.reload();
      });
    }
  })();

  function sendNotification(type, title, message) {
    const gettingAll = browser.notifications.getAll();
    gettingAll.then(function clearAndShowNotification(all) {
      for (let id in all) {
        browser.notifications.clear(id);
      }
      // https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/API/notifications/NotificationOptions
      browser.notifications.create({
        type: 'basic',
        iconUrl: 'images/logo/deeplt-48.png',
        title: 'DeepLT',
        message: message,
      });
    });
  }

  function removeOutput() {
    translation = '';
  }

  function switchLang() {
    selectionText = '';
    removeOutput();
    let tmpSource = sourceLang;
    let tmpTarget = targetLang;
    sourceLang = tmpTarget;
    targetLang = tmpSource;
    document.getElementById('translate-input').focus();
  }

  function translateOn() {
    let source_lang = document.getElementById('source-lang').value;
    let target_lang = document.getElementById('target-lang').value;
    let text = document.getElementById('translate-input').value;
    window
      .open(
        'https://www.deepl.com/translator#' +
          source_lang.toLowerCase() +
          '/' +
          target_lang.toLowerCase() +
          '/' +
          encodeURIComponent(text),
        '_blank'
      )
      .focus();
  }

  function translateWith() {

    formDisabled = true;
    
    let data = {
      auth_key: config.api_key,
      source_lang: sourceLang,
      target_lang: targetLang,
      text: selectionText,
    };

    // get actual consumption
    axios
      .get(config.api_url + '/v2/usage', {
        headers: {
          Authorization: `DeepL-Auth-Key ${config.api_key}`,
        },
      })
      .then((res) => {
        const consumption = res.data.character_count;
        const limit = config.limit;
        const nb_characters = data.text.length;

        if (consumption + nb_characters < limit) {
          axios
            .post(config.api_url + '/v2/translate', null, { params: data })
            .then((res) => {
              translation = res.data.translations[0].text;
              formDisabled = false;
            })
            .catch((error) => {
              formDisabled = false;
            });
        } else {
            formDisabled = false;
            sendNotification('basic', i18n.error, i18n.error_limit_consumption);
        }
      });
  }

  function copyTranslation() {
    if (translation !== '') {
      navigator.clipboard.writeText(translation).then(function () {
        sendNotification('basic', i18n.congratulations, i18n.congratulations_copy_translation);
      });
    }
  }
</script>

<div>
  <div class="langages mb">
    <select id="source-lang" name="source_lang" bind:value={sourceLang} disabled={formDisabled}>
      {#each langs as lang}
        <option value={lang.code}>{i18n.locale.getMessage(lang.label)}</option>
      {/each}
    </select>
    <a href={'#'} on:click={switchLang} class="switch">
      <Heroicon icon={solidSwitchHorizontal} size="1.5rem" class="icon" />
    </a>
    <select id="target-lang" name="target_lang" bind:value={targetLang} disabled={formDisabled}>
      {#each langs as lang}
        <option value={lang.code}>{i18n.locale.getMessage(lang.label)}</option>
      {/each}
    </select>
  </div>
  <div class="text-input mb">
    <textarea
      id="translate-input"
      placeholder={i18n.something}
      disabled={formDisabled}
      on:input={removeOutput}
      bind:value={selectionText}
    />
  </div>
  <div class="d-flex mtn text-center mb">
    <button class="btn btn-primary" on:click={translateOn} disabled={formDisabled}>{i18n.on}</button>
    <button class="btn btn-success" on:click={translateWith} disabled={formDisabled}>{i18n.with}</button>
  </div>
  <div class="text-output mb">
    <textarea id="translate-output" on:focus={copyTranslation} readonly>{translation}</textarea>
  </div>
</div>
