import type { IconProps } from "@icons/types";
export function PencilIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="m2 14 1.333-4 7.334-7.333c.666-.667 2-.667 2.666 0 .667.666.667 2 0 2.666L6 12.667zM10 3.333 12.667 6"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.667}
        d="m4 10 2 2"
      />
    </svg>
  );
}
