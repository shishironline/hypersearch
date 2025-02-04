/**
 * @module constant:application
 * @version 1.0.0
 * @license (C) Insight
 */

export const APP_NAME = 'Hypersearch';

//-----------------------------------------------------------------------------------------------
// ! Engine
//-----------------------------------------------------------------------------------------------

/**
 * The search engine used when there is no matching engine to the current page
 */
export const DEFAULT_FALLBACK_SEARCH_ENGINE_PREFIX = 'google.com/search';

/**
 * The search engine used when the current browser is any version of Safari
 */
export const SAFARI_FALLBACK_URL = 'https://www.ecosia.org/search';

/**
 * The User Agent string appended to sidebar tab requests when {@link SPECIAL_URL_JUNK_STRING junk string} also present
 */
export const CUSTOM_UA_STRING = 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36';

/**
 * The list of removable response header names
 */
export const STRIPPED_RESPONSE_HEADERS = [
    'x-frame-options',
    'frame-options',
    'content-security-policy',
    'access-control-allow-origin',
    'referer-policy',
];

//-----------------------------------------------------------------------------------------------
// ! Tabs
//-----------------------------------------------------------------------------------------------
export const SPECIAL_URL_JUNK_STRING = 'qhfabdyvaykdf';

export const SIDEBAR_TAB_FAKE_URL = 'https://sidebar-fake-tab/';

export const URL_PARAM_TAB_TITLE_KEY = 'insight-tab-title';
export const URL_PARAM_NO_COOKIE_KEY = 'insight-no-cookie';
export const URL_PARAM_POSSIBLE_SERP_RESULT = 'insight-possible-serp-result';

//-----------------------------------------------------------------------------------------------
// ! Options
//-----------------------------------------------------------------------------------------------

/**
 * The CSS layer of the sidebar frame
 */
export const SIDEBAR_Z_INDEX = 9999;

/**
 * The number of sidebar tabs that are pre-rendered
 */
export const PRERENDER_TABS = 3;

/**
 * The number of result domains considered top domains (augmentation matching)
 */
export const NUM_DOMAINS_TO_CONSIDER = 5;

/**
 * The maximum number of allowed result domain overlap
 */
export const NUM_DOMAINS_TO_EXCLUDE = 3;

/**
 * The minimum width of the browser window to trigger sidebar on page load finish
 */
export const WINDOW_REQUIRED_MIN_WIDTH = 1200;

/**
 * The minimum width of the browser window to trigger sidebar on gutter hover action
 */
export const HOVER_EXPAND_REQUIRED_MIN_WIDTH = 1000;

//-----------------------------------------------------------------------------------------------
// ! Development
//-----------------------------------------------------------------------------------------------
export const ENV = process.env.mode === 'development' ? 'DEV' : 'PROD';
export const IN_DEBUG_MODE = ENV === 'DEV' || window.top?.INSIGHT_FORCE_DEBUG;
