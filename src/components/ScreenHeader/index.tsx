import { Heading } from "@/kits/components/Heading";
import { Icons } from "@/kits/components/Icons";
import { IconButton } from "@/kits/components/IconButton";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { StyleUtil } from "@/kits/utils";

export interface ScreenHeaderProps {
  title: string;
  loading?: boolean;
  onBack?: () => void;
  containerClassName?: string;
  wrapperClassName?: string;
  titleClassName?: string;
  backButtonClassName?: string;
}

export const ScreenHeader = (props: ScreenHeaderProps) => {
  const {
    title,
    onBack,
    loading = false,
    containerClassName,
    wrapperClassName,
    titleClassName,
    backButtonClassName,
  } = props;

  return (
    <div className={StyleUtil.cn("sticky top-0 z-10 mb-8", containerClassName)}>
      <div
        className={StyleUtil.cn(
          "relative h-[58px] border-b border-b-gray-20 bg-white p-4",
          wrapperClassName,
        )}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <IconButton
            icon={Icons.ArrowLeft}
            variant="white"
            size="large"
            onClick={onBack}
            tooltip="Trở lại"
            tooltipPlacement="right"
            className={StyleUtil.cn(backButtonClassName)}
          />
        </div>
        <Heading
          as="h1"
          level="h5"
          className={StyleUtil.cn("line-clamp-1 px-12 text-center font-medium", titleClassName)}
        >
          {title}
        </Heading>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-[2] translate-y-full">
        <LoadingBar size="medium" active={loading} />
      </div>
    </div>
  );
};
