/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/// <reference types="web-ext-types"/>

function truncateString(str, num) {
    if (str !== undefined) {
        if (str.length > num) {
            const subStr = str.substring(0, num);
            return subStr + '...';
        } else {
            return str;
        }
    }
}

browser.menus.create({
    id: 'menus-deeplt',
    type: 'normal',
    title: '',
    contexts: ['selection'],
    icons: {
        '16': 'images/logo/deeplt-16.png',
        '32': 'images/logo/deeplt-32.png'
    }
});

browser.menus.onShown.addListener(function (info) {
    const updating = browser.menus.update('menus-deeplt', {
        title: browser.i18n.getMessage('translate', truncateString(info.selectionText, 15))
    });
    updating.then(function onUpdated() {
        browser.menus.refresh();
    });
});

browser.menus.onClicked.addListener(function (info, tab) {
    const selectionText = info.selectionText;
    (async () => {
        await browser.storage.local.set({ selectionText: selectionText });
    })();
    browser.browserAction.openPopup();
});
