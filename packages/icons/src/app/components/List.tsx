import type { IconProps } from "@icons/types";
export function List({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M21.375 12a1.125 1.125 0 0 1-1.125 1.125H3.75a1.125 1.125 0 1 1 0-2.25h16.5A1.125 1.125 0 0 1 21.375 12M3.75 7.125h16.5a1.125 1.125 0 0 0 0-2.25H3.75a1.125 1.125 0 0 0 0 2.25m16.5 9.75H3.75a1.125 1.125 0 1 0 0 2.25h16.5a1.125 1.125 0 1 0 0-2.25"
      />
    </svg>
  );
}
