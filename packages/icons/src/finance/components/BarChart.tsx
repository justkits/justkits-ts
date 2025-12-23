import type { IconProps } from "@icons/types";
export function BarChart({ size = 24, color = "#000" }: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      color={color}
    >
      <path
        fill="currentColor"
        d="M2 3.333A1.333 1.333 0 0 1 3.333 2h9.334A1.333 1.333 0 0 1 14 3.333v9.334A1.334 1.334 0 0 1 12.667 14H3.333A1.334 1.334 0 0 1 2 12.667zm10.667 0H3.333v9.334h9.334zM8 4.667a.667.667 0 0 1 .667.666v5.334a.667.667 0 0 1-1.334 0V5.333A.667.667 0 0 1 8 4.667M10.667 6a.667.667 0 0 1 .666.667v4a.667.667 0 0 1-1.333 0v-4A.666.666 0 0 1 10.667 6M5.333 7.333A.667.667 0 0 1 6 8v2.667a.667.667 0 0 1-1.333 0V8a.667.667 0 0 1 .666-.667"
      />
    </svg>
  );
}
