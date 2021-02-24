import React from 'react';
import { debug, MESSAGES } from 'lumos-shared-js';
import { nativeBrowserAddReactAppListener } from 'lib/nativeMessenger';
import { reactInjector } from 'lib/reactInjector';
import { SidebarTabsManager } from 'lib/sidebarTabsManager/sidebarTabsManager';
import { handleSubtabApiResponse } from 'lib/handleSubtabApiResponse';
import { runFunctionWhenDocumentReady } from 'utils/helpers';
import { Sidebar } from 'components/Sidebar/Sidebar';
import { flipSidebar } from 'lib/flipSidebar/flipSidebar';

const WINDOW_REQUIRED_MIN_WIDTH = 1200;

const style = document.getElementsByTagName('style')[0];

const loadSidebarCss = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = chrome.extension.getURL('./index.css');
  link.type = 'text/css';
  document.head.appendChild(link);
};

const createSidebar = (
  document: Document,
  tabs: SidebarTab[],
  suggestedAugmentations: SuggestedAugmentationObject[],
  url: string,
) => {
  debug('function call - createSidebar', tabs);

  loadSidebarCss();

  const wrapper = document.createElement('div');
  wrapper.id = 'sidebar-root';
  document.body.appendChild(wrapper);
  const sidebarInit = React.createElement(Sidebar, {
    url,
    tabs,
    suggestedAugmentations,
  });
  reactInjector(wrapper, sidebarInit, 'sidebar-root-iframe', style);

  if (window.innerWidth <= WINDOW_REQUIRED_MIN_WIDTH) {
    flipSidebar(document, 'hide');
  }

  nativeBrowserAddReactAppListener({
    window,
    message: MESSAGES.BROWSERBG_BROWSERFG_URL_UPDATED,
    callback: (msg) => {
      try {
        loadOrUpdateSidebar(document, new URL(msg.data.url));
      } catch {
        loadOrUpdateSidebar(document, new URL(window.location.href));
      }
    },
  });
};

export const loadOrUpdateSidebar = async (document: Document, url: URL) => {
  debug('function call - loadOrUpdateSidebar', document);

  const firstChild = document.documentElement.firstChild;

  if (style === firstChild) {
    document.documentElement.removeChild(style);
  }

  const sidebarTabsManager = new SidebarTabsManager();
  sidebarTabsManager.fetchSubtabs(url).then((response) => {
    if (!response) {
      return;
    }

    runFunctionWhenDocumentReady(document, async () => {
      const tabs = await handleSubtabApiResponse(url, document, response);
      !!tabs?.length && createSidebar(document, tabs, response.suggested_augmentations, url.href);
    });
  });
};
