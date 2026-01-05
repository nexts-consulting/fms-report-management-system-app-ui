import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";
import { InputGroup, InputGroupItem, InputGroupProps } from "./InputGroup";

const constants = {
  INSTANCE_NAME: "GroupedInputGroup",
};

const styles = {
  container: StyleUtil.cn("w-full"),
  section: StyleUtil.cn("mb-6"),
  sectionTitle: StyleUtil.cn("mb-3 text-base font-semibold text-gray-800"),
  sectionContent: StyleUtil.cn("bg-white"),
};

export interface GroupedInputGroupProps extends Omit<InputGroupProps, "items"> {
  /**
   * Items (can have groupKey property or will be grouped by groupBy field from data)
   */
  items: InputGroupItem[];
  /**
   * Field name to group by (if items don't have groupKey, will extract from item data)
   */
  groupBy?: string;
  /**
   * Custom group title formatter
   */
  formatGroupTitle?: (groupKey: string, items: InputGroupItem[]) => string;
}

export const GroupedInputGroup = React.memo(
  React.forwardRef<HTMLDivElement, GroupedInputGroupProps>((props, ref) => {
    const {
      items,
      groupBy,
      formatGroupTitle,
      value,
      onChange,
      ...inputGroupProps
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    });

    // Group items
    const groupedItems = React.useMemo(() => {
      const groups: Record<string, InputGroupItem[]> = {};

      items.forEach((item) => {
        let groupKey: string;
        if (item.data?.groupKey) {
          groupKey = item.data.groupKey;
        } else if (item.groupKey) {
          groupKey = item.groupKey;
        } else {
          groupKey = "Other";
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
      });

      return groups;
    }, [items, groupBy]);

    const handleGroupChange = (groupKey: string, newValue: Record<string, number>) => {
      // Merge with existing values
      const updatedValue = { ...value, ...newValue };
      onChange?.(updatedValue);
    };

    const getGroupValue = (groupKey: string): Record<string, number> => {
      const groupItems = groupedItems[groupKey] || [];
      const groupValue: Record<string, number> = {};

      groupItems.forEach((item) => {
        const itemValue = value?.[item.code];
        if (itemValue !== undefined) {
          groupValue[item.code] = itemValue;
        }
      });

      return groupValue;
    };

    return (
      <div id={ids.current.container} ref={ref} className={styles.container}>
        {Object.entries(groupedItems).map(([groupKey, groupItems]) => {
          const groupTitle = formatGroupTitle
            ? formatGroupTitle(groupKey, groupItems)
            : groupKey;

          return (
            <div key={groupKey} className={styles.section}>
              <h3 className={styles.sectionTitle}>{groupTitle}</h3>
              <div className={styles.sectionContent}>
                <InputGroup
                  {...inputGroupProps}
                  items={groupItems}
                  value={getGroupValue(groupKey)}
                  onChange={(newValue) => handleGroupChange(groupKey, newValue)}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }),
);

GroupedInputGroup.displayName = constants.INSTANCE_NAME;

