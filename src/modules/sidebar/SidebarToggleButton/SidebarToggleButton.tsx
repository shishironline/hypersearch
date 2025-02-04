/**
 * @module modules:sidebar
 * @version 1.0.0
 * @license (C) Insight
 */

import React, { useRef } from 'react';
import List from 'antd/lib/list';
import Tooltip from 'antd/lib/tooltip';
import SidebarLoader from 'lib/sidebar';
import { flipSidebar } from 'lib/flip';
import { removeEmoji } from 'lib/helpers';
import {
  APP_NAME,
  EMPTY_AUGMENTATION,
  SIDEBAR_TAB_FAKE_URL,
  URL_PARAM_TAB_TITLE_KEY,
  EXPAND_KEY,
  SIDEBAR_Z_INDEX,
} from 'constant';
import 'antd/lib/divider/style/index.css';
import 'antd/lib/button/style/index.css';
import 'antd/lib/tooltip/style/index.css';
import 'antd/lib/list/style/index.css';
import './SidebarToggleButton.scss';
import { handleIcon } from 'lib/icon';

//-----------------------------------------------------------------------------------------------
// ! Magics
//-----------------------------------------------------------------------------------------------
const TOOLTIP_TEXT = `Preview Filters ("${EXPAND_KEY.KEY}" key)`;
const MORE_TABS_TEXT = '<placeholder> more';
const LIST_STYLE = { paddingRight: 5 };
const MAX_TAB_LENGTH = 3;

//-----------------------------------------------------------------------------------------------
// ! Component
//-----------------------------------------------------------------------------------------------
export const SidebarToggleButton: SidebarToggleButton = ({ tabs }) => {
  const tooltipContainer = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    SidebarLoader.isPreview = true;
    flipSidebar(document, 'show', SidebarLoader);
  };

  const filteredTabs = tabs.filter(({ url }) => url?.href !== SIDEBAR_TAB_FAKE_URL);

  // Calculate the relative height of the nub by using the tab's title length
  const tabHeight = filteredTabs.length
    ? tabs.slice(0, MAX_TAB_LENGTH + 1).reduce((a, tab) => {
        const titleLength =
          tab.augmentation.name.length * 8 < 50 ? 50 : tab.augmentation.name.length * 8; // 1 ch is approximately 8 px
        const titleSpace = 50; // space for one line
        return a + Math.abs(titleLength / titleSpace) * 30; // average height of a line
      }, 0)
    : 0;

  const dataSource =
    tabs.length > 3
      ? filteredTabs.slice(0, MAX_TAB_LENGTH).concat([
          {
            url: new URL('https://example.com'),
            augmentation: {
              ...EMPTY_AUGMENTATION,
              name: MORE_TABS_TEXT.replace(
                '<placeholder>',
                String(filteredTabs.length - MAX_TAB_LENGTH),
              ),
            },
          },
        ])
      : filteredTabs;

  const containerStyle = { zIndex: SIDEBAR_Z_INDEX + 1 };
  const keepParent = { keepParent: false };

  //-----------------------------------------------------------------------------------------------
  // ! Render
  //-----------------------------------------------------------------------------------------------
  const ListItem = (item: SidebarTab) => {
    const icon = item.augmentation.icon ? handleIcon(item.augmentation.icon) : null;
    const title = (
      <span>
        { icon }{ `${ icon ? ' ' : '' }${(item.url.searchParams.get(URL_PARAM_TAB_TITLE_KEY) ?? removeEmoji(item.augmentation.name)).trim()}` }
      </span>
    );

    return (
      <List.Item>
        <List.Item.Meta
          title={
            title
          }
        />
      </List.Item>
    )
  };

  return (
    <>
      <Tooltip
        title={TOOLTIP_TEXT}
        destroyTooltipOnHide={keepParent}
      >
        <div
          onClick={handleClick}
          className="insight-sidebar-toggle-button"
          data-height={tabHeight}
        >
          <div className="insight-sidebar-toggle-appname">
            <span className="insight-sidebar-toggle-appname-text">{APP_NAME}</span>
          </div>
          <div className="insight-list">
            {!!dataSource.length && (
              <List
                style={LIST_STYLE}
                itemLayout="horizontal"
                dataSource={dataSource}
                renderItem={ListItem}
              />
            )}
          </div>
        </div>
      </Tooltip>
      <div className="tooltip-container" ref={tooltipContainer} style={containerStyle} />
    </>
  );
};
