import type { IconProps } from "@icons/types";
export function ImageIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        fillRule="evenodd"
        d="M4.667 4.667a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-.667 2a.667.667 0 1 1 1.333 0 .667.667 0 0 1-1.333 0"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm12 1.333H2A.667.667 0 0 0 1.333 4v8a.667.667 0 0 0 .667.667h2.876L9.461 8.08a2 2 0 0 1 2.829 0l2.377 2.376V4A.667.667 0 0 0 14 3.333m0 9.334H6.761l3.644-3.643a.667.667 0 0 1 .942 0l3.258 3.257a.67.67 0 0 1-.605.386"
        clipRule="evenodd"
      />
    </svg>
  );
}
