import React from "react";
import { Icons } from "@/kits/components/icons";

const constants = {
  INSTANCE_NAME: "DynamicIcon",
  DEFAULT_SIZE: 20,
} as const;

async function loadCarbonIcon(iconName: string) {
  try {
    const icons = await import("@carbon/icons-react");
    return icons[iconName as keyof typeof icons];
  } catch (error) {
    console.error(`Failed to load icon: ${iconName}`, error);
    return null;
  }
}

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export const DynamicIcon = React.memo((props: DynamicIconProps) => {
  const { name, size = constants.DEFAULT_SIZE, className } = props;

  const [Icon, setIcon] = React.useState<React.ElementType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    setError(false);

    loadCarbonIcon(name)
      .then((icon) => {
        if (icon) {
          setIcon(() => icon);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, backgroundColor: "#e0e0e0" }}
        aria-label="Loading icon"
      />
    );
  }

  if (error || !Icon) {
    return <Icons.WarningFilled className={className} aria-label="Icon not found" />;
  }

  return <Icon size={size} className={className} />;
});

DynamicIcon.displayName = constants.INSTANCE_NAME;