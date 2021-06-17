import { MY_BLOCKLIST_ID, MY_BLOCKLIST_NAME, MY_TRUSTLIST_ID, MY_TRUSTLIST_NAME } from './index';
import {
  ACTION_EVALUATION,
  ACTION_KEY,
  ACTION_LABEL,
  CONDITION_EVALUATION,
  CONDITION_KEY,
  CONDITION_LABEL,
  LEGACY_ACTION_TYPE,
  LEGACY_CONDITION_TYPE,
  LEGACY_EVALUATION,
} from './augmentations';

export const EMPTY_AUGMENTATION = {
  actions: {
    action_list: [],
    evaluate_with: ACTION_EVALUATION.AND,
  },
  conditions: {
    condition_list: [
      {
        evaluation: LEGACY_EVALUATION.CONTAINS,
        key: CONDITION_KEY.SEARCH_CONTAINS,
        unique_key: CONDITION_KEY.SEARCH_CONTAINS,
        label: CONDITION_LABEL.SEARCH_CONTAINS,
        type: LEGACY_CONDITION_TYPE.LIST,
        value: [],
      },
    ],
    evaluate_with: CONDITION_EVALUATION.OR,
  },
  description: '',
  enabled: false,
  id: '',
  installed: false,
  name: '',
} as Augmentation;

export const ANY_URL_CONDITION_TEMPLATE = {
  evaluation: LEGACY_EVALUATION.MATCHES,
  key: CONDITION_KEY.ANY_SEARCH_ENGINE,
  unique_key: CONDITION_KEY.ANY_SEARCH_ENGINE,
  label: CONDITION_LABEL.ANY_SEARCH_ENGINE,
  type: LEGACY_CONDITION_TYPE.LIST,
  value: ['.*'],
};

export const SEARCH_INTENT_IS_US_NEWS_TEMPLATE = {
  key: CONDITION_KEY.SEARCH_INTENT_IS,
  unique_key: CONDITION_KEY.SEARCH_INTENT_IS,
  label: CONDITION_LABEL.SEARCH_INTENT_IS,
  type: LEGACY_CONDITION_TYPE.LIST,
  value: ['news_us'],
};

export const TOUR_AUGMENTATION = {
  name: '🗞 My Trusted News',
  description: 'News sources I trust',
  conditions: {
    condition_list: [SEARCH_INTENT_IS_US_NEWS_TEMPLATE],
    evaluate_with: CONDITION_EVALUATION.OR,
  },
  actions: {
    action_list: [
      {
        key: ACTION_KEY.SEARCH_DOMAINS,
        label: ACTION_LABEL.SEARCH_DOMAINS,
        type: LEGACY_ACTION_TYPE.LIST,
        value: ['cnn.com', 'foxnews.com', 'wsj.com', 'bloomberg.com', 'apnews.com'],
      },
    ],
  },
} as Augmentation;

export const MY_BLOCKLIST_TEMPLATE = {
  ...EMPTY_AUGMENTATION,
  id: MY_BLOCKLIST_ID,
  name: MY_BLOCKLIST_NAME,
  enabled: true,
  conditions: {
    ...EMPTY_AUGMENTATION.conditions,
    condition_list: [ANY_URL_CONDITION_TEMPLATE],
  },
  actions: {
    ...EMPTY_AUGMENTATION.actions,
    action_list: [
      {
        key: ACTION_KEY.SEARCH_HIDE_DOMAIN,
        label: ACTION_LABEL.SEARCH_HIDE_DOMAIN,
        type: LEGACY_ACTION_TYPE.LIST,
        value: [],
      },
    ],
  },
} as Augmentation;

export const MY_TRUSTLIST_TEMPLATE = {
  ...EMPTY_AUGMENTATION,
  id: MY_TRUSTLIST_ID,
  name: MY_TRUSTLIST_NAME,
  enabled: true,
  conditions: {
    ...EMPTY_AUGMENTATION.conditions,
    condition_list: [ANY_URL_CONDITION_TEMPLATE],
  },
  actions: {
    ...EMPTY_AUGMENTATION.actions,
    action_list: [
      {
        key: ACTION_KEY.SEARCH_DOMAINS,
        label: ACTION_LABEL.SEARCH_DOMAINS,
        type: LEGACY_ACTION_TYPE.LIST,
        value: [],
      },
    ],
  },
} as Augmentation;

export const EMPTY_CUSTOM_SEARCH_ENGINE_BLOB = {
  querySelector: {
    desktop: '',
    featured: [],
    pad: '',
    phone: '',
    container: '',
    result_container_selector: '',
  },
  search_engine_json: {
    required_params: [],
    required_prefix: '',
  },
} as SearchEngineObject;
