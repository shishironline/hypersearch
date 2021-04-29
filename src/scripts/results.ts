/**
 * @module Results
 * @author Matyas Angyal<matyas@laso.ai>
 * @license (C) Insight
 * @version 1.0.0
 * @description
 *  This script is handling the creation of the inline gutter unit buttons and overlays.
 *  These buttons are created on the left of each SERP result and if a result is blocked,
 *  an overlay will appear above its container element. The script is communicating with
 *  the extension through the window `postMessage` API. Whenever an augmentation has been
 *  processed by AugmentationManager (create, edit, delete ...etc) or loaded to the sidebar,
 *  a message will be sent which triggers an iteration of creating gutter unit elements.
 */
const GOOGLE_VERTICAL_NEWS_LINK_SELECTOR = '.EPLo7b a';
const GOOGLE_HORIZONTAL_NEWS_LINK_SELECTOR = '.JJZKK a';

import {
  DOMAINS_TO_RELEVANT_SLICE,
  INSIGHT_ALLOWED_RESULT_SELECTOR,
  INSIGHT_BLOCKED_BY_SELECTOR,
  INSIGHT_BLOCKED_DOMAIN_SELECTOR,
  INSIGHT_HIDDEN_RESULT_SELECTOR,
  INSIGHT_SEARCHED_DOMAIN_SELECTOR,
  INSIGHT_SEARCHED_RESULT_SELECTOR,
  INSIGHT_SEARCH_BY_SELECTOR,
  PROCESS_SERP_OVERLAY_MESSAGE,
  REMOVE_HIDE_DOMAIN_OVERLAY_MESSAGE,
  REMOVE_SEARCHED_DOMAIN_MESSAGE,
  SEARCH_DOMAINS_ACTION,
  SEARCH_HIDE_DOMAIN_ACTION,
} from 'utils/constants';
import { debug, extractUrlProperties, runFunctionWhenDocumentReady } from 'utils/helpers';
import { processSerpResults } from 'utils/processSerpResults/processSerpResults';

const searchedResults: HTMLElement[] = [];
const searchingAugmentations: Record<string, AugmentationObject[]> = Object.create(null);
const blockingAugmentations: Record<string, AugmentationObject[]> = Object.create(null);

((document, window) => {
  const processAugmentation = (
    augmentation: AugmentationObject,
    domain: string,
    result?: HTMLElement,
  ) => {
    if (!augmentation || !domain) return null;
    if (!searchingAugmentations[domain]) searchingAugmentations[domain] = [];
    if (!blockingAugmentations[domain]) blockingAugmentations[domain] = [];
    augmentation.actions?.action_list.forEach(({ value, key }) => {
      if (value.find((valueDomain) => domain === valueDomain)) {
        switch (key) {
          case SEARCH_HIDE_DOMAIN_ACTION:
            if (!blockingAugmentations[domain].find(({ id }) => id === augmentation.id)) {
              blockingAugmentations[domain].push(augmentation);
            }
            break;
          case SEARCH_DOMAINS_ACTION:
            result && searchedResults.push(result);
            if (!searchingAugmentations[domain].find(({ id }) => id === augmentation.id)) {
              searchingAugmentations[domain].push(augmentation);
            }
            break;
        }
      }
    });
  };

  const getResults = (data: ResultMessageData) => {
    const processed: HTMLElement[] = [];

    searchedResults.length = 0; // empty search results

    const processNewsResults = (selector: string) => {
      return Array.from(document.querySelectorAll(selector)).map((el) => {
        // Set default container selector explicitly on the news link's container to ensure
        // news links are handled separately. Otherwise, the whole section would be selected.
        el.closest(selector.split(' ')[0]).setAttribute(
          data.selector.container.replace(/[^\w-]/gi, ''), // eg.: [data-hveid] -> data-hveid
          'true',
        );
        return el;
      });
    };

    const results = Array.from(document.querySelectorAll(data.selector.link)).concat(
      // handle Google's news results
      !!document.location.href.match(/google\.com/gi)?.length
        ? processNewsResults(GOOGLE_HORIZONTAL_NEWS_LINK_SELECTOR).concat(
            processNewsResults(GOOGLE_VERTICAL_NEWS_LINK_SELECTOR),
          )
        : [],
    ) as HTMLElement[];

    const featured = data.selector.featured?.reduce((a, selector) => {
      const link = document.querySelector(selector);
      const container = link.closest(selector.split(' ')[0]);
      link && container && a.push({ link, container });
      return a;
    }, []);

    [...featured, ...results].forEach((element) => {
      const result = element instanceof HTMLElement ? element : element.link;

      const urlProps = extractUrlProperties(
        result instanceof HTMLLinkElement
          ? result.getAttribute('href')
          : result?.closest('a').getAttribute('href'),
      );

      const resultDomain = DOMAINS_TO_RELEVANT_SLICE[urlProps.hostname]
        ? urlProps.full.match(DOMAINS_TO_RELEVANT_SLICE[urlProps.hostname])?.[0] ??
          urlProps.hostname
        : urlProps.hostname;

      const container = element instanceof HTMLElement ? result : element.container;

      if (data.hideDomains?.length) {
        data.hideDomains.forEach((hideDomain) => {
          if (!!hideDomain && resultDomain === hideDomain) {
            if (Array.isArray(data.augmentation)) {
              data.augmentation.forEach((augmentation) =>
                processAugmentation(augmentation, hideDomain),
              );
            } else {
              processAugmentation(data.augmentation, hideDomain);
            }
          }
        });
      }
      processed.push(container);
      if (Array.isArray(data.augmentation)) {
        data.augmentation.forEach((augmentation) =>
          processAugmentation(augmentation, resultDomain, container),
        );
      } else {
        processAugmentation(data.augmentation, resultDomain, container);
      }
    });
    return processed;
  };

  const processResults = (data: ResultMessageData) => {
    processSerpResults(
      [...searchedResults, ...getResults(data)],
      data.selector.container,
      {
        header: null,
        text: null,
        selectorString: 'hidden-domain',
      },
      { block: blockingAugmentations, search: searchingAugmentations },
    );
  };

  const handler = ({ data }: RemoveMessage) => {
    switch (data?.name) {
      // Iterate over the SERP results and check if they searched by the augmentation specified
      // by `data.remove` (augmentation ID). If so, remove the ID from their `searched-by` attribute
      // and in case there is no other augmentation matched to the result, remove the gutter unit.
      case REMOVE_SEARCHED_DOMAIN_MESSAGE:
        if (!data.domain || !data.remove) break;
        searchingAugmentations[data.domain] = (searchingAugmentations[data.domain] ?? []).filter(
          ({ id }) => id !== data.remove,
        );
        const searchedElements = Array.from(
          document.querySelectorAll(`[${INSIGHT_SEARCH_BY_SELECTOR}]`),
        );
        searchedElements.forEach((element) => {
          const idList = element.getAttribute(INSIGHT_SEARCH_BY_SELECTOR).replace(data.remove, '');
          if (element.getAttribute(INSIGHT_SEARCHED_DOMAIN_SELECTOR) !== data.domain) {
            return null;
          }
          element.setAttribute(INSIGHT_SEARCH_BY_SELECTOR, idList);
          element.setAttribute(
            INSIGHT_SEARCHED_RESULT_SELECTOR,
            String(!!idList.split(' ').filter((i) => !!i).length), // "true" | "false"
          );
        });
        processResults(data);
        break;
      // Iterate over the currently blocked SERP results and check if they blocked by the augmentation specified
      // in the message data. When a matching blocked result found, remove the augmentation ID from the "blocked-by"
      // attribute. If there is no more augmentation blocking the results, remove the overlay and set it as allowed.
      case REMOVE_HIDE_DOMAIN_OVERLAY_MESSAGE:
        if (!data.domain || !data.remove) break;
        blockingAugmentations[data.domain] = (blockingAugmentations[data.domain] ?? []).filter(
          ({ id }) => id !== data.remove,
        );
        const blockedElements = Array.from(
          document.querySelectorAll(`[${INSIGHT_BLOCKED_BY_SELECTOR}]`),
        );
        blockedElements.forEach((element) => {
          const ids = element.getAttribute(INSIGHT_BLOCKED_BY_SELECTOR).replace(data.remove, '');
          if (element.getAttribute(INSIGHT_BLOCKED_DOMAIN_SELECTOR) !== data.domain) {
            return null;
          }
          element.setAttribute(INSIGHT_HIDDEN_RESULT_SELECTOR, 'false');
          element.setAttribute(INSIGHT_ALLOWED_RESULT_SELECTOR, 'true');
          element.setAttribute(INSIGHT_BLOCKED_BY_SELECTOR, ids);
          const overlay = element.querySelector('.insight-hidden-domain-overlay');
          !ids.split(' ')?.filter((i) => !!i).length && overlay?.parentElement.removeChild(overlay);
        });
        processResults(data);
        break;
      case PROCESS_SERP_OVERLAY_MESSAGE:
        runFunctionWhenDocumentReady(document, function processResultsMessage() {
          processResults(data);
        });
        break;
    }
  };

  try {
    window.top.addEventListener('message', handler);
    window.addEventListener('message', handler);
  } catch (err) {
    debug('results listener - error', err);
  }
})(document, window);
