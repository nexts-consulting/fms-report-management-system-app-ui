import { StringUtil, StyleUtil } from "@/kits/utils";
import React from "react";

const constants = {
  INSTANCE_NAME: "HighlightText",
};

const styles = {
  highlight: StyleUtil.cn("bg-primary-60/10"),
};

export interface HighlightTextProps {
  text: string;
  highlightValue: string;
}

export const HighlightText = React.memo((props: HighlightTextProps) => {
  const { text, highlightValue } = props;

  const parts = StringUtil.getHighlightParts(text, highlightValue);

  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className={part.isMatch ? styles.highlight : undefined}>
          {part.text}
        </span>
      ))}
    </>
  );
});

HighlightText.displayName = constants.INSTANCE_NAME;
