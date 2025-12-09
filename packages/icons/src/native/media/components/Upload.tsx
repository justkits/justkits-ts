import Svg, { Path } from "react-native-svg";
import type { IconProps } from "@icons/types";
export function Upload({ size = 24, color = "#000" }: Readonly<IconProps>) {
  return (
    <Svg
      fill="none"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      color={color}
    >
      <Path
        fill="currentColor"
        d="M12.9 6.693A4.993 4.993 0 0 0 3.567 5.36 3.996 3.996 0 0 0 0 9.333c0 2.207 1.793 4 4 4h8.667A3.335 3.335 0 0 0 16 10a3.317 3.317 0 0 0-3.1-3.307M9.333 8.667v2.666H6.667V8.667h-2l3.1-3.1a.33.33 0 0 1 .473 0l3.093 3.1z"
      />
    </Svg>
  );
}
