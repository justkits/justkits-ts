import type { IconProps } from "@icons/types";
export function Plus({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M12 8.665H8.667V12a.667.667 0 1 1-1.334 0V8.665H4a.667.667 0 1 1 0-1.333h3.333V3.999a.667.667 0 0 1 1.334 0v3.333H12a.666.666 0 1 1 0 1.333"
      />
    </svg>
  );
}
