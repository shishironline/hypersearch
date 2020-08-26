import {
  ISidebarTab,
  User,
  CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR,
  debug,
  STYLE_COLOR_BORDER,
  STYLE_PADDING_SMALL,
  STYLE_WIDTH_SIDEBAR,
  STYLE_ZINDEX_MAX,
  STYLE_WIDTH_SIDEBAR_TAB,
  STYLE_SIDEBAR_HIDER_X_OFFSET,
  STYLE_SIDEBAR_HIDER_Y_OFFSET,
  STYLE_SIDEBAR_TOGGLER_WIDTH,
  STYLE_FONT_SIZE_SMALL,
  STYLE_BORDER_RADIUS_PILL,
  CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_SHOW,
  CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_HIDE,
  STYLE_FONT_SIZE_LARGE,
  STYLE_PADDING_MEDIUM,
  STYLE_COLOR_TEXT,
  STYLE_SIDEBAR_SHOWER_Y_OFFSET,
  STYLE_WIDTH_SIDEBAR_TAB_LEFT,
  STYLE_WIDTH_SIDEBAR_TAB_RIGHT,
  CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_OVERLAY,
  CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_CONTENT,
  CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_TABS,
  STYLE_PADDING_XLARGE,
  STYLE_COLOR_LUMOS_DARK_ORANGE,
  LUMOS_APP_BASE_URL,
  STYLE_COLOR_UNSELECTED_TAB,
} from 'lumos-shared-js';
import { runFunctionWhenDocumentReady } from './helpers';
import { MESSAGES as LUMOS_WEB_MESSAGES } from 'lumos-web/src/components/Constants';
import SidebarTabsManager from './sidebarTabsManager';

const MIN_CLIENT_WIDTH_AUTOSHOW = 1200;

let mostRecentLumosUrl = null;

const sidebarTabsManager = new SidebarTabsManager();
const sidebarIframes = [];

function isVisible(document: Document): boolean {
  let sidebarContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR);
  return sidebarContainer.style.width == STYLE_WIDTH_SIDEBAR ? true : false;
}

function flipSidebar(document: Document, force?: string): void {
  let sidebarContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR);
  let serpOverlayContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_OVERLAY);
  let showButton = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_SHOW);
  let hideButton = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_HIDE);
  let tabsContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_TABS);
  let contentContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_CONTENT);

  if ((force && force == 'hide') || (isVisible(document) && force !== 'show')) {
    // hide sidebar
    if (tabsContainer && contentContainer) {
      tabsContainer.style.visibility = 'hidden';
      contentContainer.style.visibility = 'hidden';
    }

    sidebarContainer.style.visibility = 'hidden';
    showButton.style.visibility = 'visible';
    hideButton.style.visibility = 'hidden';
    sidebarContainer.style.width = '0px';
    // serpOverlayContainer.style.display = "none"
  } else {
    // show sidebar
    sidebarContainer.style.visibility = 'visible';
    showButton.style.visibility = 'hidden';
    hideButton.style.visibility = 'visible';
    // serpOverlayContainer.style.display = "block"
    sidebarContainer.style.width = STYLE_WIDTH_SIDEBAR;
    if (tabsContainer && contentContainer) {
      tabsContainer.style.visibility = 'visible';
      contentContainer.style.visibility = 'visible';
    }
  }
}

function isSidebarLoaded(document): boolean {
  debug('function call - isSidebarLoaded', document);
  return !!document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR);
}

export function createSidebar(document: Document) {
  debug('function call - createSidebar');

  window.addEventListener(
    'message',
    (msg) => {
      if (msg.data && msg.data.command) {
        const { data } = msg;
        switch (data.command) {
          case LUMOS_WEB_MESSAGES.WEB_CONTENT_URL_UPDATED:
            mostRecentLumosUrl = data.updatedUrl;
            break;
        }
      }
    },
    false,
  );

  let serpOverlayContainer = document.createElement('div');
  serpOverlayContainer.id = CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_OVERLAY;
  serpOverlayContainer.setAttribute(
    'style',
    `
        position: fixed;
        z-index: ${STYLE_ZINDEX_MAX};
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: black;
        opacity: 0.6;
        transition: opacity 0.5s ease;
        display: none;
    `,
  );
  serpOverlayContainer.addEventListener('click', () => {
    flipSidebar(document);
  });
  document.body.appendChild(serpOverlayContainer);
  let sidebarContainer = document.createElement('div');
  sidebarContainer.id = CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR;

  sidebarContainer.setAttribute(
    'style',
    `
        position: fixed;

        /* side  of screen */
        right: 0;
        border-right: 1px solid ${STYLE_COLOR_BORDER};

        top: 0;
        width: 0;
        bottom: 0;
        height: 100%;
        z-index: ${STYLE_ZINDEX_MAX};
        background: white;
        transition-property: all;
        transition-duration: .5s;
        transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
        border-left: 3px solid ${STYLE_COLOR_LUMOS_DARK_ORANGE};
    `,
  );

  // For dismissing the sidebar
  let sidebarToggler = document.createElement('div');
  let sidebarTogglerWhenHidden = document.createElement('div');
  let lumosLogoTitle = document.createElement('div');
  let lumosLogo = document.createElement('img');
  lumosLogo.src = chrome.extension.getURL('logo128.png');
  lumosLogoTitle.setAttribute(
    'style',
    `
        border-bottom: 0.5px solid #bbb;
    `,
  );
  lumosLogo.setAttribute(
    'style',
    `
        display: inline-block;
        margin-left: ${STYLE_PADDING_SMALL};
        width: ${STYLE_WIDTH_SIDEBAR_TAB_LEFT};
    `,
  );
  let lumosTitle = document.createElement('div');
  lumosTitle.setAttribute(
    'style',
    `
        display: inline-block;
        vertical-align: super;
        max-width: ${STYLE_WIDTH_SIDEBAR_TAB_RIGHT};
    `,
  );
  lumosTitle.appendChild(document.createTextNode('Alternatives (press \\)'));
  lumosLogoTitle.appendChild(lumosLogo);
  lumosLogoTitle.appendChild(lumosTitle);
  sidebarTogglerWhenHidden.appendChild(lumosLogoTitle);
  sidebarTogglerWhenHidden.id = CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_SHOW;

  let sidebarTogglerWhenVisible = document.createElement('div');
  let xNode = document.createElement("div")
  xNode.appendChild(document.createTextNode('×'))
  xNode.setAttribute("style", `
    top: 6px;
    position: absolute;
  `)
  sidebarTogglerWhenVisible.appendChild(xNode);
  sidebarTogglerWhenVisible.id = CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_HIDE;

  // build a ui to switch between sub-tabs within the sidebar
  let tabsContainer = document.createElement('div');
  tabsContainer.id = CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_TABS;
  tabsContainer.setAttribute(
    'style', 
    `
        display: flex;
        background-color: #f7f7f7;  /* custom color */
        padding: 5px 0 0 20px;
    `
  );
  let contentContainer = document.createElement('div');
  contentContainer.id = CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_CONTENT;
  contentContainer.setAttribute(
    'style',
    `
        height: 100%;
    `
  );

  sidebarToggler.setAttribute(
    'style',
    `
        cursor: pointer;
    `,
  );

  sidebarTogglerWhenHidden.setAttribute(
    'style',
    `
        position: fixed;
        right: 0;
        bottom: ${STYLE_SIDEBAR_SHOWER_Y_OFFSET};
        max-width: ${STYLE_SIDEBAR_TOGGLER_WIDTH};
        padding: ${STYLE_PADDING_XLARGE};
        border: 3px solid ${STYLE_COLOR_LUMOS_DARK_ORANGE};
        background: white;
        border-right: none;
        border-radius: ${STYLE_BORDER_RADIUS_PILL} 0 0 ${STYLE_BORDER_RADIUS_PILL};
        font-size: ${STYLE_FONT_SIZE_SMALL};
        z-index: ${STYLE_ZINDEX_MAX};
        cursor: pointer;
    `,
  );
  sidebarTogglerWhenVisible.setAttribute(
    'style',
    `
        position: absolute;
        left: ${STYLE_SIDEBAR_HIDER_X_OFFSET};
        top: ${STYLE_SIDEBAR_HIDER_Y_OFFSET};
        height: 10px;
        width: 10px;
        border: 3px solid ${STYLE_COLOR_LUMOS_DARK_ORANGE};
        background: white;
        border-radius: 50%;
        font-size: ${STYLE_FONT_SIZE_LARGE};
        padding: ${STYLE_PADDING_MEDIUM};
    `,
  );

  sidebarTogglerWhenHidden.addEventListener('click', function (e) {
    flipSidebar(document);
  });
  sidebarTogglerWhenVisible.addEventListener('click', function (e) {
    flipSidebar(document);
  });

  sidebarToggler.appendChild(sidebarTogglerWhenVisible);
  document.body.appendChild(sidebarTogglerWhenHidden);

  document.onkeypress = function (e: KeyboardEvent) {
    if (e.key === '\\') {
      if (
        !(
          document.activeElement.nodeName == 'TEXTAREA' ||
          document.activeElement.nodeName == 'INPUT' ||
          document.activeElement.nodeName == 'DIV'
        )
      ) {
        flipSidebar(document);
      }
    }
  };
  document.onkeydown = function (e: KeyboardEvent) {
    if (
      sidebarContainer.style.visibility === 'visible' &&
      (e.key === 'ArrowRight' || e.key === 'ArrowLeft')
    ) {
      let tabContainer = document.getElementById('lumos_sidebar_tabs');
      if (tabContainer) {
        let selectedChild: HTMLElement;
        let next: Element;
        let prev: Element;

        function triggerEvent(elem, event) {
          var clickEvent = new Event(event); // Create the event.
          elem.dispatchEvent(clickEvent); // Dispatch the event.
        }

        tabContainer.childNodes.forEach((child, i) => {
          let c = child as HTMLElement;
          if (c.style.backgroundColor == 'white') {
            selectedChild = c;
            prev = c.previousElementSibling
              ? c.previousElementSibling
              : tabContainer.lastElementChild;
            next = c.nextElementSibling ? c.nextElementSibling : tabContainer.firstElementChild;
          }
        });

        if (selectedChild && prev && next) {
          if (e.key === 'ArrowLeft') {
            triggerEvent(prev, 'click');
          } else if (e.key === 'ArrowRight') {
            triggerEvent(next, 'click');
          }
        }
      }
    }
  };

  const sidebarOverlayContainer = document.createElement('div');
  sidebarOverlayContainer.setAttribute(
    'style',
    `
        z-index: ${STYLE_ZINDEX_MAX};
        background: #f7f7f7;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        opacity: 0;
    `,
  );

  sidebarContainer.appendChild(sidebarToggler);
  sidebarContainer.appendChild(tabsContainer);
  sidebarContainer.appendChild(contentContainer);
  sidebarContainer.appendChild(sidebarOverlayContainer);
  sidebarContainer.addEventListener('mouseover', () => {
    sidebarOverlayContainer.style.right = null;
    sidebarOverlayContainer.style.bottom = null;
  });

  document.body.appendChild(sidebarContainer);
  flipSidebar(document, 'hide');

  // special case: by default hiding the sidebar will show this toggle but wem hide it until
  // content is populated
  sidebarTogglerWhenHidden.style.visibility = 'hidden';
}

export function populateSidebar(document: Document, sidebarTabs: Array<ISidebarTab>): void {
  // mutates document

  // check if sidebar has been created
  debug('function call - populateSidebar: ', sidebarTabs);
  let container = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR);
  if (!container) {
    debug('did not find sidebar element');
  }

  // build a ui to switch between sub-tabs within the sidebar
  const tabsContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_TABS);
  const contentContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_CONTENT);

  // Cleaning old content before adding new
  while (tabsContainer.firstChild) {
    tabsContainer.removeChild(tabsContainer.firstChild);
  }

  while (contentContainer.firstChild) {
    contentContainer.removeChild(contentContainer.firstChild);
  }

  // create a ui to preview the sidebar when it is hidden
  let sidebarTogglerWhenHidden = document.getElementById(
    CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_SHOW,
  );
  Array.from(sidebarTogglerWhenHidden.getElementsByClassName('sidebar_preview_item')).forEach(
    (e) => {
      e.parentNode.removeChild(e);
    },
  );
  // special case: we only show this once we are sure there are alternative pages
  sidebarTogglerWhenHidden.style.visibility = 'visible';

  // populate the sidebar and preview UIs with content from the response
  const defaultIndex = sidebarTabs.findIndex(sidebarTab => sidebarTab.default);
  sidebarTabs.forEach(function (sidebarTab: ISidebarTab, idx) {
    const tab = addSubtab(document, sidebarTab);

    if (defaultIndex !== -1 || idx === 0) {
      selectTabElement(tab);
    }
  });
}

const tabElementIndex = (tabElement: HTMLElement) => {
  const elements = Array.from(tabElement.parentElement.children);
  return elements.indexOf(tabElement);
};

const selectTabElement = (tabElement: HTMLElement) => {
  tabElement.style.backgroundColor = 'white';
  tabElement.style.fontWeight = 'bold';
  tabElement.style.borderColor = 'white';

  const index = tabElementIndex(tabElement);

  if (index >= 0) {
    sidebarIframes[index].style.visibility = 'inherit';
    sidebarIframes[index].style.height = '100%';
  }
};

const unselectTabElement = (tabElement: HTMLElement) => {
  tabElement.style.backgroundColor = STYLE_COLOR_UNSELECTED_TAB;
  tabElement.style.fontWeight = 'normal';
  tabElement.style.borderColor = STYLE_COLOR_UNSELECTED_TAB;
};

const unselectAllTabs = (tabsContainer: HTMLElement, contentContainer: HTMLElement) => {
  for (let child = tabsContainer.firstChild; child !== null; child = child.nextSibling) {
    let castedChild = <HTMLElement>child;
    unselectTabElement(castedChild);
  }

  for (let child = contentContainer.firstChild; child !== null; child = child.nextSibling) {
    let castedChild = <HTMLElement>child;
    castedChild.style.visibility = 'hidden';
    castedChild.style.height = '0';
  }
};

const removeSidebarTab = (tabElement: HTMLElement) => {
  const index = tabElementIndex(tabElement);

  if (index >= 0) {
    tabElement.remove();
    sidebarIframes.splice(index, 1)?.[0].remove();
  }
};

function addSubtab(document: HTMLDocument, sidebarTab: ISidebarTab, index: number = -1) {
  const tabsContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_TABS);
  const contentContainer = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_CONTENT);
  let sidebarTogglerWhenHidden = document.getElementById(
    CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_SHOW,
  );

  // preview element that lives outside the sidebar
  let sidebarPreviewItem = document.createElement('div');
  sidebarPreviewItem.appendChild(document.createTextNode(sidebarTab.title));
  sidebarPreviewItem.setAttribute(
    'style',
    `
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: ${STYLE_PADDING_SMALL} 0;
          font-weight: bold;
      `,
  );
  sidebarPreviewItem.classList.add('sidebar_preview_item');
  sidebarTogglerWhenHidden.appendChild(sidebarPreviewItem);
  
  let tabElement = document.createElement('span');
  let contentIframe = document.createElement('iframe');

  let pinElement = document.createElement("span")
  pinElement.appendChild(document.createTextNode('📌'))
  pinElement.setAttribute('style', `
    margin-left: 5px;
  `)
  pinElement.addEventListener('click', () => {
    const pinnedTab = sidebarTabsManager.pinSidebarTab(mostRecentLumosUrl ? mostRecentLumosUrl : contentIframe.src);
    unselectAllTabs(tabsContainer, contentContainer);
    selectTabElement(addSubtab(document, pinnedTab, 0));
  })
  
  let unpinElement = document.createElement("span")
  unpinElement.appendChild(document.createTextNode('❌'))
  unpinElement.setAttribute('style', `
    margin-left: 5px;
  `);
  unpinElement.addEventListener('click', () => {
    const index = tabElementIndex(tabElement);
    sidebarTabsManager.unpinSidebarTab(index);
    removeSidebarTab(tabElement);
    selectTabElement(<HTMLElement>tabsContainer.firstElementChild);
  });

  tabElement.appendChild(document.createTextNode(sidebarTab.title));
  if (sidebarTab.isPinnedTab) {
    tabElement.appendChild(unpinElement);

  } else if (sidebarTab.url.host === new URL(LUMOS_APP_BASE_URL).host) {
    tabElement.appendChild(pinElement);
  }
  tabElement.setAttribute(
    'style',
    `
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${STYLE_FONT_SIZE_SMALL};
          padding: ${STYLE_PADDING_MEDIUM} ${STYLE_PADDING_SMALL};
          text-align: center;
          color: ${STYLE_COLOR_TEXT};
          background: ${STYLE_COLOR_UNSELECTED_TAB};
          width: ${STYLE_WIDTH_SIDEBAR_TAB};
          cursor: pointer;
          border-radius: 10px 10px 0 0;
      `,
  );

  // load the urls of the subtabs into iframes
  
  contentIframe.src = sidebarTab.url.href;
  contentIframe.setAttribute(
    'style',
    `
          width: 100%;
          height: 100%;
          border: none;
      `,
  );
  contentIframe.addEventListener('load', (e) => {
    debug('iframe loaded');
    if (sidebarTab.default && document.body.clientWidth > MIN_CLIENT_WIDTH_AUTOSHOW) {
      flipSidebar(document, 'show');
    }
  });

  // set the default subtab
  // if (sidebarTab.default || (idx === 0 && !isThereADefault)) {
  //   contentIframe.style.visibility = 'inherit';
  //   contentIframe.style.height = '100%';
  //   selectTabElement(tabElement);
  // } else {
  //   contentIframe.style.visibility = 'hidden';
  // }

  //  enable switching between tabs
  tabElement.addEventListener('click', function (e) {
    const clickSrc = <HTMLElement>(e.target || e.srcElement);

    if (clickSrc !== tabElement) {
      return;
    }
    
    unselectAllTabs(tabsContainer, contentContainer);
    selectTabElement(clickSrc);
  });

  // insert tab and content into container
  const children = tabsContainer.children;
  const insertIndex = children.length > index ? index : -1;

  if (index === -1) {
    tabsContainer.appendChild(tabElement);
    sidebarIframes.push(contentIframe);
  } else {
    tabsContainer.insertBefore(tabElement, children[insertIndex]);
    sidebarIframes.splice(insertIndex, 0, contentIframe);
  }
  contentContainer.appendChild(contentIframe);

  return tabElement;
}

function showLoginSubtabs(document: Document, url: URL): void {
  const tabs = sidebarTabsManager.loginSubtabs(url);
  populateSidebar(document, tabs);
}

export function reloadSidebar(document: Document, url: URL, user: User): void {
  flipSidebar(document, "hide");

  // Making sure showButton is hidden before reloading sidebar
  // in case it should not appear anymore
  const showButton = document.getElementById(CONTENT_PAGE_ELEMENT_ID_LUMOS_SIDEBAR_SHOW);
  showButton.style.visibility = "hidden";

  loadOrUpdateSidebar(document, url, user);
}

export function loadOrUpdateSidebar(document: Document, url: URL, user: User): void {
  // mutates document

  if (user) {
    const sidebarTabs = sidebarTabsManager.getPinnedTabs();
    runFunctionWhenDocumentReady(document, () => {
      if (sidebarTabs?.length > 0) {
        if (!isSidebarLoaded(document)) {
          createSidebar(document);
        }
        populateSidebar(document, sidebarTabs);
        flipSidebar(document, 'show');
      }
    });

    sidebarTabsManager.fetchSubtabs(user, url, sidebarTabs.length !== 0)
      .then(sidebarTabs => {
        runFunctionWhenDocumentReady(document, () => {
          if (!isSidebarLoaded(document)) {
            createSidebar(document);
          }

          sidebarTabs.forEach(sidebarTab => addSubtab(document, sidebarTab));
        });
      });
  } else {
    runFunctionWhenDocumentReady(document, () => {
      showLoginSubtabs(document, url)
    });
  }
}
