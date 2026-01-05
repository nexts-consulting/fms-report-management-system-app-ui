import { constants } from "../../constants";
import React from "react";
import { useLocalContext } from "../../contexts/local.context";
import { Button } from "@/kits/components/button";
import { Icons } from "@/kits/components/icons";

export interface ContinueButtonProps {}

export const ContinueButton = React.memo((props: ContinueButtonProps) => {
  const {} = props;

  const localContext = useLocalContext();
  const localStore = localContext.store;

  const isUserInLocationScope = localStore.use.isUserInLocationScope();
  const onContinue = localStore.use.onContinue();
  const gpsConfig = localStore.use.gpsConfig?.() ?? undefined;
  const user = localStore.use.user();

  // Determine if button should be shown based on GPS config mode
  const shouldShowButton = React.useMemo(() => {
    // If no GPS config, use default behavior (only show when in scope)
    if (!gpsConfig) {
      return isUserInLocationScope === true;
    }

    const mode = gpsConfig.mode;
    const isRequired = gpsConfig.is_required ?? false;

    // If GPS is not required (is_required === false), user doesn't need GPS coordinates
    // Show button if user has location (optional GPS)
    if (!isRequired || mode === "NOT_REQUIRED") {
      return !!user?.gps;
    }

    // If GPS is required (is_required === true), user must have GPS coordinates
    // Then check mode to determine if strict location check is needed

    // For VISIBLE_OPTIONAL: GPS is visible but optional, show when user has location
    if (mode === "VISIBLE_OPTIONAL") {
      return !!user?.gps;
    }

    // For REQUIRED_BUT_NOT_STRICT: GPS required but not strict, show when user has location (even if not in scope)
    if (mode === "REQUIRED_BUT_NOT_STRICT") {
      return !!user?.gps;
    }

    // For REQUIRED_AT_LOCATION: GPS required and strict, only show when in scope
    if (mode === "REQUIRED_AT_LOCATION") {
      return isUserInLocationScope === true;
    }

    // Default: only show when in scope
    return isUserInLocationScope === true;
  }, [isUserInLocationScope, gpsConfig, user?.gps]);

  if (!shouldShowButton) return <></>;

  return (
    <div className="absolute right-4 top-4 z-[1001]">
      <Button size="medium" icon={Icons.ArrowRight} onClick={onContinue}>
        Tiếp tục
      </Button>
    </div>
  );
});

ContinueButton.displayName = `${constants.INSTANCE_NAME}.ContinueButton`;
