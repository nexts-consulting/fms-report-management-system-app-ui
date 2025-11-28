import React from "react";
import { useLocalContext } from "../../contexts/local.context";
import { constants } from "../../constants";
import { TabsControl } from "./tabs-control";

export interface SummaryProps {}

export const Summary = React.memo((props: SummaryProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const loading = localStore.use.loading();
  const summaryTabs = localStore.use.summaryTabs();
  const activeSummaryTabIdx = localStore.use.activeSummaryTabIdx();
  const isExpandedSummary = localStore.use.isExpandedSummary();

  if (loading) return <></>;

  return (
    <div className="z-10 w-full">
      <div className="relative space-y-4 border-t border-gray-20 bg-white p-4">
        <TabsControl />
        {isExpandedSummary && React.createElement(summaryTabs[activeSummaryTabIdx].tabElement)}
      </div>
    </div>
  );
});

Summary.displayName = `${constants.INSTANCE_NAME}.Summary`;
