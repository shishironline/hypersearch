import { MESSAGES, debug, CLIENT_MESSAGES, SPECIAL_URL_JUNK_STRING } from 'lumos-shared-js';
import { BackgroundMessenger } from 'lib/backgroundMessenger/backgroundMessenger';
import { HOSTNAME_TO_PATTERN } from 'lumos-shared-js/src/content/constants_altsearch';
import { syncLocalSearchEngines } from 'lib/syncLocalSearchEngines/syncLocalSearchEngines';
import { SHOW_AUGMENTATION_TAB } from 'components/SidebarTabs/SidebarTabs';
import { OPEN_AUGMENTATION_BUILDER_MESSAGE } from 'utils/helpers';

const USER_AGENT_REWRITE_URL_SUBSTRINGS = Object.values(HOSTNAME_TO_PATTERN).map((s) =>
  s.replace('{searchTerms}', ''),
);

export const URL_TO_TAB = {};

// eslint-disable-next-line
/* @ts-ignore */
const isFirefox = typeof InstallTrigger !== 'undefined';
const extraSpec = ['blocking', 'responseHeaders', isFirefox ? null : 'extraHeaders'].filter(
  (i) => i,
);

debug('installing listener override response headers');
// https://gist.github.com/dergachev/e216b25d9a144914eae2#file-manifest-json
// this is to get around loading pages in iframes that otherwise
// don't want to be loaded in iframes
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    const strippedHeaders = [
      'x-frame-options',
      'frame-options',
      'content-security-policy',
      'referer-policy',
    ];
    const responseHeaders = details.responseHeaders.filter((responseHeader) => {
      const deleted = !strippedHeaders.includes(responseHeader.name.toLowerCase());
      return deleted;
    });

    return {
      responseHeaders: [
        ...responseHeaders,
        {
          name: 'Content-Security-Policy',
          value: `frame-ancestors *`,
        },
        {
          name: 'Access-Control-Allow-Origin',
          value: 'no-cors',
        },
      ],
    };
  },
  {
    urls: ['<all_urls>'],
    types: ['sub_frame'],
  },
  extraSpec,
);

debug('installing listener for overriding request headers');
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const requestHeaders = details.requestHeaders.map((requestHeader) => {
      // this is for the search result iframes loaded in the sidebar, we pretend the browser is mobile for them
      const specialUrl = details.url.includes(SPECIAL_URL_JUNK_STRING);
      const urlMatchesSearchPattern =
        specialUrl ||
        USER_AGENT_REWRITE_URL_SUBSTRINGS.filter((substring) => details.url.includes(substring))
          .length > 0;
      if (
        urlMatchesSearchPattern &&
        details.frameId > 0 &&
        requestHeader.name.toLowerCase() === 'user-agent'
      ) {
        requestHeader.value =
          'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';
      }

      return requestHeader;
    });

    return {
      requestHeaders,
    };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestHeaders'],
);

debug('installing listener for onUpdated');
function onUpdatedListener(tabId, changeInfo, tab) {
  debug('function call - onUpdatedListener:', tabId, changeInfo, tab);
  if (changeInfo.url) {
    debug('changeInfo has URL:', changeInfo.url);
    chrome.tabs.sendMessage(
      tabId,
      {
        data: {
          command: MESSAGES.BROWSERBG_BROWSERFG_URL_UPDATED,
          url: changeInfo.url,
        },
      },
      () => debug(chrome.runtime.lastError),
    );
  }
  URL_TO_TAB[tab.url] = tabId;
}

window.onload = () => {
  const messenger = new BackgroundMessenger();
  messenger.loadHiddenMessenger(document, window);
};

chrome.tabs.onUpdated.addListener(onUpdatedListener);

chrome.browserAction.onClicked.addListener(function (tab) {
  debug(
    'message from background to content script',
    CLIENT_MESSAGES.BROWSER_CONTENT_FLIP_NON_SERP_CONTAINER,
  );
  chrome.tabs.sendMessage(tab.id, {
    data: {
      command: CLIENT_MESSAGES.BROWSER_CONTENT_FLIP_NON_SERP_CONTAINER,
    },
  });
});

chrome.browserAction.setBadgeBackgroundColor({ color: 'black' });

chrome.webNavigation.onBeforeNavigate.addListener(() => {
  syncLocalSearchEngines();
});

chrome.browserAction.onClicked.addListener((tab) => {
  !SHOW_AUGMENTATION_TAB
    ? chrome.tabs.create({ active: true, url: 'http://share.insightbrowser.com/14' })
    : chrome.tabs.sendMessage(tab.id, { type: OPEN_AUGMENTATION_BUILDER_MESSAGE });
});
