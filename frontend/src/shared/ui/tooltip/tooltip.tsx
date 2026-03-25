import type { ReactNode } from "react";
import "./tootip.css";
import { Tooltip } from "antd";

export default function WhiteTooltip({
  object,
  children,
  open,
}: {
  object: ReactNode;
  children: ReactNode;
  open: boolean;
}) {
  return (
    <Tooltip
      placement="topLeft"
      style={{ maxWidth: "456px", width: "100%" }}
      title={children}
      open={open}
    >
      {object}
    </Tooltip>
  );
}
