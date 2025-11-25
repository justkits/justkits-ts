import type { IconProps } from "@icons/types";
export function File({ size = 24, color = "#000" }: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 16 16"
      color={color}
    >
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.333}
        d="M6.667 2v2.667A.667.667 0 0 1 6 5.333H3.333m9.334-2.666v10.666A.666.666 0 0 1 12 14H4a.666.666 0 0 1-.667-.667V5.276c0-.177.07-.346.196-.471l2.609-2.61A.67.67 0 0 1 6.609 2H12a.666.666 0 0 1 .667.667Z"
      />
    </svg>
  );
}
