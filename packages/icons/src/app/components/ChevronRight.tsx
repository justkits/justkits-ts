import type { IconProps } from "@icons/types";
export function ChevronRight({
  size = 24,
  color = "#000",
}: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      color={color}
    >
      <path
        fill="currentColor"
        d="M7.833 16.667c-.333 0-.666-.167-.833-.333-.5-.5-.5-1.334 0-1.834l4.5-4.5L7 5.5c-.5-.5-.5-1.333 0-1.833s1.333-.5 1.833 0L14.333 9c.5.5.5 1.334 0 1.834l-5.5 5.333q-.5.5-1 .5"
      />
    </svg>
  );
}
