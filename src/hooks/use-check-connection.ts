import { useGlobalContext } from "@/contexts/global.context";
import { useNavigatorStatus } from "./use-navigator-status";
import React from "react";
import { useNotification } from "@/kits/components/Notification";

export const useCheckConnection = () => {
  const globalStore = useGlobalContext();

  const navigatorStatus = useNavigatorStatus();
  const notification = useNotification();

  const connectionToastIdRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (navigatorStatus === false) {
      connectionToastIdRef.current = notification.pending({
        title: "Lost connection",
        description: "Kết nối của bạn đã bị gián đoạn, vui lòng kiểm tra và tải lại.",
        options: {
          immortal: true,
        },
      });
    } else {
      if (connectionToastIdRef.current) {
        notification.update(connectionToastIdRef.current, {
          type: "success",
          title: "Reconnected",
          description: "Kết nối của bạn đã được khôi phục.",
          options: {
            duration: 5000,
          },
        });
      }
    }

    globalStore.setState({ navigatorOnline: navigatorStatus });
  }, [navigatorStatus]);
};
