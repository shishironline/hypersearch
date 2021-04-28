import React, { useEffect, useState } from 'react';
import { Info } from 'react-feather';
import Typography from 'antd/lib/typography';
import Button from 'antd/lib/button';
import SidebarLoader from 'lib/SidebarLoader/SidebarLoader';
import { SEARCH_DOMAINS_ACTION } from 'utils';
import 'antd/lib/typography/style/index.css';
import 'antd/lib/button/style/index.css';
import './SidebarTabMeta.scss';

const { Paragraph } = Typography;

export const SidebarTabMeta: SidebarTabMeta = ({ tab }) => {
  const [currentStat, setCurrentStat] = useState<number>(
    SidebarLoader.augmentationStats[tab.id] ?? 0,
  );
  const [domains, setDomains] = useState<string[]>(SidebarLoader.tabDomains[tab.id][tab.url] ?? []);
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleToggle = () => setExpanded((prev) => !prev);

  const showDomains =
    Array.from(new Set(tab.augmentation?.actions.action_list.map(({ key }) => key))).indexOf(
      SEARCH_DOMAINS_ACTION,
    ) > -1;

  const ellipsis = {
    rows: 2,
    symbol: 'more',
  };

  useEffect(() => {
    setCurrentStat(SidebarLoader.augmentationStats[tab.id] ?? 0);
    setDomains(SidebarLoader.tabDomains[tab.id][tab.url]);
  }, [SidebarLoader.augmentationStats[tab.id], SidebarLoader.tabDomains[tab.id][tab.url]]);

  const showMeta = currentStat > 0 || !!tab.description.length || !!domains?.length;

  return showMeta ? (
    <div id="tab-meta-container">
      <div id="meta-info-icon-container">
        <Info stroke={'#999'} />
      </div>
      <div id="sidebar-tab-meta">
        <Paragraph
          ellipsis={!expanded && ellipsis}
          className={`meta-text ${expanded ? 'expanded' : 'collapsed'}`}
        >
          {currentStat > 0 && <span className="space-right">{currentStat} Uses.</span>}
          {tab.description && <span className="space-right">{tab.description}</span>}
          {tab.url && tab.isCse && showDomains && (
            <>
              <span className="space-right">Lens&nbsp;sources&nbsp;include</span>
              {Array.from(new Set(domains))?.map((domain, index, originalDomainsArray) => (
                <a href={`https://${domain}`} className="meta-link" key={domain} target="_blank">
                  {`${!originalDomainsArray[index + 1] ? domain : `${domain},\u00a0`}`}
                </a>
              ))}
            </>
          )}
        </Paragraph>
        <Button id="meta-toggle-button" type="link" onClick={handleToggle}>
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </div>
    </div>
  ) : null;
};
