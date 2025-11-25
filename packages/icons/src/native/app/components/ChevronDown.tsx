import Svg, { Path } from "react-native-svg";
import type { IconProps } from "@icons/types";
export function ChevronDown({
  size = 24,
  color = "#000",
}: Readonly<IconProps>) {
  return (
    <Svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      color={color}
    >
      <Path
        fill="currentColor"
        d="M4.44 8.94a1.5 1.5 0 0 1 2.12 0L12 14.38l5.44-5.44a1.5 1.5 0 0 1 2.12 2.12l-6.5 6.5a1.5 1.5 0 0 1-2.12 0l-6.5-6.5a1.5 1.5 0 0 1 0-2.12"
      />
    </Svg>
  );
}
