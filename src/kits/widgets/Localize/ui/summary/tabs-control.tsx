import React from "react";
import { useLocalContext } from "../../contexts/local.context";
import { constants } from "../../constants";
import { Icons } from "@/kits/components/icons";
import { IconButton } from "@/kits/components/icon-button";
export interface TabsControlProps {}

export const TabsControl = React.memo((props: TabsControlProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const summaryTabs = localStore.use.summaryTabs();
  const isExpandedSummary = localStore.use.isExpandedSummary();

  const handleClickTab = (idx: number) => {
    localStore.setState({
      activeSummaryTabIdx: idx,
      isExpandedSummary: true,
    });
  };

  const handleToggleExpandedSummary = () => {
    localStore.setState({
      isExpandedSummary: !isExpandedSummary,
    });
  };

  return (
    <div className="grid grid-cols-6">
      <div className="col-span-1" />
      <div className="col-span-4 flex items-center justify-center divide-x divide-gray-30">
        {summaryTabs.map((tab, idx) => (
          <IconButton
            key={tab.key}
            icon={tab.icon as any}
            onClick={() => handleClickTab(idx)}
            variant="gray-10"
          />
        ))}
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <IconButton
          icon={isExpandedSummary ? Icons.ChevronDown : Icons.ChevronUp}
          onClick={handleToggleExpandedSummary}
          variant="gray-10"
        />
      </div>
    </div>
  );
});

TabsControl.displayName = `${constants.INSTANCE_NAME}.Summary.TabsControl`;
