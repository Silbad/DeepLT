<script lang="ts">
  import axios from 'axios';

  // variables
  let noData = true;
  let optionsDeepLT = {};
  let consumptionLimit = 500000;
  let consumptionFree = 500000;
  let consumptionPro = 50000000;
  let consumptionMax = consumptionFree;
  let formDisabled = false;
  let api_url = 'https://api-free.deepl.com';
  let api_key = '';
  let consumption = 0;
  let storage_type = 'local';
  let consumptionFormated = formatConsumption();
  const i18n = {
    note: browser.i18n.getMessage('note'),
    save: browser.i18n.getMessage('save'),
    api_deepl_key: browser.i18n.getMessage('api_deepl_key'),
    free: browser.i18n.getMessage('free'),
    pro: browser.i18n.getMessage('pro'),
    cost_control: browser.i18n.getMessage('cost_control'),
    firefox_storage_type: browser.i18n.getMessage('firefox_storage_type'),
    local: browser.i18n.getMessage('local'),
    sync: browser.i18n.getMessage('sync'),
    consumption: browser.i18n.getMessage('consumption'),
    error: browser.i18n.getMessage('error'),
    error_apikey: browser.i18n.getMessage('error_apikey'),
    error_apikey_required: browser.i18n.getMessage('error_apikey_required'),
    error_save_data: browser.i18n.getMessage('error_save_data'),
    error_remove_data: browser.i18n.getMessage('error_remove_data'),
    congratulations: browser.i18n.getMessage('congratulations'),
    congratulations_remove_data: browser.i18n.getMessage('congratulations_remove_data'),
    remove_data: browser.i18n.getMessage('remove_data'),
    congratulations_save_data_local: browser.i18n.getMessage('congratulations_save_data_local'),
    congratulations_save_data_sync: browser.i18n.getMessage('congratulations_save_data_sync'),
    confirm_remove_data: browser.i18n.getMessage('confirm_remove_data'),
    api_key_placeholder: browser.i18n.getMessage('api_key_placeholder'),
  };

  (async () => {
    let dataLocale = {};
    let dataSync = {};
    // get optionsDeepLT
    await browser.storage.local.get('optionsDeepLT').then((value) => {
      dataLocale = value.optionsDeepLT;
    });
    await browser.storage.sync.get('optionsDeepLT').then((value) => {
      dataSync = value.optionsDeepLT;
    });
    if (dataLocale !== undefined || dataSync !== undefined) {
      optionsDeepLT = dataLocale !== undefined ? dataLocale : dataSync;

      // update form
      noData = false;
      api_url = optionsDeepLT.api_url;
      api_key = optionsDeepLT.api_key;
      consumptionMax = api_url === 'https://api-free.deepl.com' ? consumptionFree : consumptionPro;
      consumptionLimit = optionsDeepLT.limit;
      storage_type = optionsDeepLT.storage_type;

      // get cost control
      formatCostControl(consumptionLimit);

      // get consumption
      if (api_key.length) {
        getConsumption();
      }
    }
  })();

  function initData() {
    noData = true;
    consumptionLimit = 500000;
    consumptionFree = 500000;
    consumptionPro = 50000000;
    consumptionMax = consumptionFree;
    formDisabled = false;
    api_url = 'https://api-free.deepl.com';
    api_key = '';
    consumption = 0;
    storage_type = 'local';
    consumptionFormated = formatConsumption();
  }

  function removeData() {
    if (window.confirm(i18n.confirm_remove_data)) {
      formDisabled = true;
      if (storage_type === 'local') {
        browser.storage.local.remove('optionsDeepLT').then(
          function () {
            initData();
            sendNotification('basic', i18n.congratulations, i18n.congratulations_remove_data);
            formDisabled = false;
          },
          function () {
            sendNotification('basic', i18n.error, i18n.error_remove_data);
            formDisabled = false;
          }
        );
      } else if (storage_type === 'sync') {
        browser.storage.sync.remove('optionsDeepLT').then(
          function () {
            initData();
            sendNotification('basic', i18n.congratulations, i18n.congratulations_remove_data);
            formDisabled = false;
          },
          function () {
            sendNotification('basic', i18n.error, i18n.error_remove_data);
            formDisabled = false;
          }
        );
      }
    }
  }

  function getConsumption() {
    axios
      .get(api_url + '/v2/usage', {
        headers: {
          Authorization: `DeepL-Auth-Key ${api_key}`,
        },
      })
      .then((res) => {
        const gettingAll = browser.notifications.getAll();
        gettingAll.then(function clearAndShowNotification(all) {
          for (let id in all) {
            browser.notifications.clear(id);
          }
          consumption = res.data.character_count;
          consumptionFormated = formatConsumption();
        });
      })
      .catch((error) => {
        consumption = 0;
        consumptionFormated = formatConsumption();
        if (api_key !== '') {
          sendNotification('basic', i18n.error, i18n.error_apikey);
        }
      });
  }

  function formatCostControl(limit) {
    let consumptionFormated = new Intl.NumberFormat().format(limit);
    let amount = api_url === 'https://api-free.deepl.com' ? (limit - 500000) * 0.00002 : limit * 0.00002;
    amount = amount < 0 ? 0 : amount;
    let amountFormated = new Intl.NumberFormat(browser.i18n.getUILanguage(), {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
    return browser.i18n.getMessage('limit', [
      '<strong>' + consumptionFormated + '</strong>',
      '<strong>' + amountFormated + '</strong>',
    ]);
  }

  function formatConsumption() {
    let consumptionFormated = new Intl.NumberFormat().format(consumption);
    let amount = api_url === 'https://api-free.deepl.com' ? 0 : consumption * 0.00002;
    amount = amount < 1 ? 0 : amount;
    let amountFormated = new Intl.NumberFormat(browser.i18n.getUILanguage(), {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
    return browser.i18n.getMessage('cost', [
      '<strong>' + consumptionFormated + '</strong>',
      '<strong>' + amountFormated + '</strong>',
    ]);
  }

  function changeMax(event) {
    api_url = event.currentTarget.value;
    if (api_url === 'https://api-free.deepl.com') {
      consumptionMax = consumptionFree;
      consumptionLimit = consumptionLimit > consumptionFree ? consumptionFree : consumptionLimit;
    } else {
      consumptionMax = consumptionPro;
    }
    formatCostControl(consumptionLimit);
    getConsumption();
  }

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

  function saveForm() {
    formDisabled = true;
    const optionsDeeplt = document.querySelector('form');
    const formData = new FormData(optionsDeeplt);
    var data = {};
    formData.forEach(function (value, key) {
      data[key] = value.trim();
    });
    if (data.api_key === '') {
      sendNotification('basic', i18n.error, i18n.error_apikey_required);
      formDisabled = false;
      return false;
    }
    if (data.storage_type === 'local') {
      browser.storage.local.set({ optionsDeepLT: data }).then(
        function () {
          noData = false;
          browser.storage.sync.remove('optionsDeepLT');
          sendNotification('basic', i18n.congratulations, i18n.congratulations_save_data_local);
          formDisabled = false;
        },
        function () {
          sendNotification('basic', i18n.error, i18n.error_save_data);
          formDisabled = false;
        }
      );
    } else if (data.storage_type === 'sync') {
      browser.storage.sync.set({ optionsDeepLT: data }).then(
        function () {
          browser.storage.local.remove('optionsDeepLT');
          sendNotification('basic', i18n.congratulations, i18n.congratulations_save_data_sync);
          formDisabled = false;
        },
        function () {
          sendNotification('basic', i18n.error, i18n.error_save_data);
          formDisabled = false;
        }
      );
    }
  }
</script>

<div>
  <form id="options-deeplt" name="options_deeplt">
    <div class="note">
      {i18n.note}<br /><a href="https://www.deepl.com/pro#developer" target="_blank"
        >https://www.deepl.com/pro#developer</a
      >
    </div>
    <h2>{i18n.api_deepl_key}</h2>
    <div class="mb">
      <input
        id="api-free"
        type="radio"
        name="api_url"
        value="https://api-free.deepl.com"
        on:change={changeMax}
        checked={api_url === 'https://api-free.deepl.com' ? true : false}
        disabled={formDisabled}
      />
      <label for="api-free">{i18n.free}</label>
      <input
        id="api-pro"
        type="radio"
        name="api_url"
        value="https://api.deepl.com"
        on:change={changeMax}
        checked={api_url === 'https://api.deepl.com' ? true : false}
        disabled={formDisabled}
      />
      <label for="api-pro">{i18n.pro}</label>
    </div>
    <div class="mb">
      <textarea
        name="api_key"
        placeholder={i18n.api_key_placeholder}
        on:change={getConsumption}
        disabled={formDisabled}
        bind:value={api_key}
      />
    </div>
    <h2>{i18n.cost_control}</h2>
    <div class="mb">
      <input
        id="limit"
        name="limit"
        type="range"
        min="0"
        step="100"
        max={consumptionMax}
        bind:value={consumptionLimit}
        disabled={formDisabled}
      />
      <br />
      {@html formatCostControl(consumptionLimit)}
    </div>
    <h2>{i18n.consumption}</h2>
    <div class="mb">
      {@html consumptionFormated}
    </div>
    <h2>{i18n.firefox_storage_type}</h2>
    <div class="mb">
      <input
        id="storage-local"
        type="radio"
        name="storage_type"
        value="local"
        checked={storage_type === 'local' ? true : false}
        disabled={formDisabled}
      />
      <label for="storage-local">{i18n.local}</label>
      <input
        id="storage-sync"
        type="radio"
        name="storage_type"
        value="sync"
        checked={storage_type === 'sync' ? true : false}
        disabled={formDisabled}
      />
      <label for="storage-sync">{i18n.sync}</label>
    </div>
    <div class="d-flex">
      <button class="mt btn-primary" type="button" on:click={removeData} disabled={noData || formDisabled}>
        {i18n.remove_data}
      </button>
      <button class="mt btn-success" type="button" on:click={saveForm} disabled={formDisabled}>
        {i18n.save}
      </button>
    </div>
  </form>
</div>
