import type { IconProps } from "@icons/types";
export function PersonIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M3 18c0-2.482 5.996-4 9-4s9 1.518 9 4v3H3z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10"
        clipRule="evenodd"
      />
    </svg>
  );
}
