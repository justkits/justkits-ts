import type { IconProps } from "@icons/types";
export function LockIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M8 11.333a1.334 1.334 0 1 0 0-2.667 1.334 1.334 0 0 0 0 2.667m4-6a1.333 1.333 0 0 1 1.333 1.334v6.666A1.333 1.333 0 0 1 12 14.667H4a1.333 1.333 0 0 1-1.333-1.334V6.667A1.333 1.333 0 0 1 4 5.333h.667V4a3.333 3.333 0 1 1 6.666 0v1.333zM8 2a2 2 0 0 0-2 2v1.333h4V4a2 2 0 0 0-2-2"
      />
    </svg>
  );
}
