import { constants } from "../../constants";
import React from "react";
import { useLocalContext } from "../../contexts/local.context";
import { Button } from "@/kits/components/Button";
import { Icons } from "@/kits/components/Icons";

export interface ContinueButtonProps {}

export const ContinueButton = React.memo((props: ContinueButtonProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const isUserInLocationScope = localStore.use.isUserInLocationScope();
  const onContinue = localStore.use.onContinue();

  if (!isUserInLocationScope) return <></>;

  return (
    <div className="absolute right-4 top-4 z-[1001]">
      <Button size="medium" icon={Icons.ArrowRight} onClick={onContinue}>
        Tiếp tục
      </Button>
    </div>
  );
});

ContinueButton.displayName = `${constants.INSTANCE_NAME}.ContinueButton`;
