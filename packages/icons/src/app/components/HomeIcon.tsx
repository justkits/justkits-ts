import type { IconProps } from "@icons/types";
export function HomeIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.167 10H2.5L10 2.5l7.5 7.5h-1.667M4.167 10v5.833A1.666 1.666 0 0 0 5.833 17.5h8.334a1.667 1.667 0 0 0 1.666-1.667V10"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7.5 17.5v-5a1.666 1.666 0 0 1 1.667-1.667h1.666A1.666 1.666 0 0 1 12.5 12.5v5"
      />
    </svg>
  );
}
