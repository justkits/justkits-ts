import type { IconProps } from "@icons/types";
export function ChevronUpIcon({
  size = 24,
  color = "#000",
}: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      color={color}
    >
      <path
        fill="currentColor"
        d="M4.44 15.06a1.5 1.5 0 0 0 2.12 0L12 9.62l5.44 5.44a1.5 1.5 0 0 0 2.12-2.12l-6.5-6.5a1.5 1.5 0 0 0-2.12 0l-6.5 6.5a1.5 1.5 0 0 0 0 2.12"
      />
    </svg>
  );
}
