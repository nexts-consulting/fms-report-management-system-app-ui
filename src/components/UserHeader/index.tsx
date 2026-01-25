import { useTick } from "@/kits/hooks/use-tick";
import { StringUtil, StyleUtil } from "@/kits/utils";
import Image from "next/image";
import { useGlobalContext } from "@/contexts/global.context";
import { IconButton } from "@/kits/components/icon-button";
import { Icons } from "@/kits/components/icons";
import { UserMenu } from "../UserMenu";
import React from "react";
import { useAuthContext } from "@/contexts/auth.context";

const constants = {
  INSTANCE_NAME: "UserHeader",
  DEFAULT_LOGO: "/images/nextsystem-logo.webp",
} as const;

interface UserHeaderProps {
  name: string;
  code?: string;
  avatar: string;
  isOnWorking?: boolean;
  renderAction?: () => React.ReactNode;
}

export const UserHeader = React.memo((props: UserHeaderProps) => {
  const { name, code, avatar, renderAction, isOnWorking = false } = props;

  const globalStore = useGlobalContext();
  const authStore = useAuthContext();
  
  const navigatorOnline = globalStore.use.navigatorOnline();
  const tenant = authStore.use.tenant();
  const project = authStore.use.project();

  const [now, controls] = useTick({ unit: "minute" });
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const logoUrl = React.useMemo(
    () => project?.logo_url || tenant?.logo_url || constants.DEFAULT_LOGO,
    [project?.logo_url, tenant?.logo_url]
  );

  React.useEffect(() => {
    if (isMenuOpen) {
      controls.on();
    } else {
      controls.off();
    }
  }, [controls, isMenuOpen]);

  return (
    <>
      <UserMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="sticky top-0 z-10 mb-4 border-b border-b-gray-20 bg-gray-10 pt-4">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src={logoUrl}
                  alt={project?.name || tenant?.name || "Logo"}
                  width={90}
                  height={27}
                />
              </div>
              {avatar && (
                <div className="relative shrink-0">
                  <Image
                    src={avatar}
                    alt="avatar"
                    className={StyleUtil.cn(
                      "!h-12 !w-12 rounded-full bg-white object-cover outline outline-2 -outline-offset-1 outline-white",
                      { "outline-primary-50": isOnWorking },
                    )}
                    quality={100}
                    height={500}
                    width={500}
                  />
                  <div
                    className={StyleUtil.cn(
                      "absolute bottom-0 right-0 h-3 w-3 -translate-x-1/3 rounded-full",
                      {
                        "bg-green-40": navigatorOnline,
                        "bg-red-50": !navigatorOnline,
                      },
                    )}
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="mb-1 line-clamp-1 text-sm text-gray-100">
                  <span className="font-medium">{name}</span>{" "}
                  {code && <span className="text-gray-30">[{code}]</span>}
                </p>
                <p className="line-clamp-1 text-sm text-gray-50">
                  {StringUtil.toTitleCase(now.format("dddd, "))}
                  {now.format("D/M/YYYY HH:mm A")}
                </p>
              </div>
            </div>
            {renderAction && <div className="shrink-0">{renderAction()}</div>}
          </div>
          <IconButton
            icon={Icons.Menu}
            variant="gray-10"
            size="xlarge"
            onClick={() => setIsMenuOpen(true)}
          />
        </div>
      </div>
    </>
  );
});

UserHeader.displayName = constants.INSTANCE_NAME;
