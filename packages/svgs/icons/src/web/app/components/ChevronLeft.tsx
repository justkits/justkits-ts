import type { IconProps } from "@icons/types";
export function ChevronLeft({
  size = 24,
  color = "#000",
}: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 20 20"
      color={color}
    >
      <path
        fill="currentColor"
        d="M5.979 10.041c0 .334.166.667.333.834l5.5 5.5c.5.5 1.333.5 1.833 0s.5-1.334 0-1.834l-4.5-4.5 4.5-4.5c.5-.5.5-1.333 0-1.833s-1.333-.5-1.833 0L6.479 9.041q-.5.5-.5 1"
      />
    </svg>
  );
}
