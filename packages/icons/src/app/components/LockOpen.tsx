import type { IconProps } from "@icons/types";
export function LockOpen({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M12 13.333V6.667H4v6.666zm0-8a1.333 1.333 0 0 1 1.333 1.334v6.666A1.333 1.333 0 0 1 12 14.667H4a1.333 1.333 0 0 1-1.333-1.334V6.667A1.333 1.333 0 0 1 4 5.333h6V4a2 2 0 1 0-4 0H4.667a3.333 3.333 0 1 1 6.666 0v1.333zm-4 6a1.334 1.334 0 1 1 0-2.667 1.334 1.334 0 0 1 0 2.667"
      />
    </svg>
  );
}
