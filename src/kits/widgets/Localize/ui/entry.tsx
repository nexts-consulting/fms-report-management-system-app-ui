import React from "react";
import { constants } from "../constants";
import { Map } from "./map";
import { Summary } from "./summary";
import { useStoreCompute } from "../hooks/use-store-compute";

interface EntryProps {}

export const Entry = React.memo((props: EntryProps) => {
  const {} = props;

  useStoreCompute();

  return (
    <div className="relative flex h-auto w-full">
      <div className="flex h-full w-full flex-col">
        <Map />
        <Summary />
      </div>
    </div>
  );
});

Entry.displayName = `${constants.INSTANCE_NAME}.Entry`;
