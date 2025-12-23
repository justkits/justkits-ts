import type { IconProps } from "@icons/types";
export function Hashtag({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.333}
        d="M6.667 2 4 14m8-12L9.333 14M2.667 5.333H14M2 10.667h11.333"
      />
    </svg>
  );
}
