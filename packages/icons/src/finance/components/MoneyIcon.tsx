import type { IconProps } from "@icons/types";
export function MoneyIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        stroke="currentColor"
        strokeWidth={2}
        d="M16 16c0-1.105-3.134-2-7-2m7 2c0 1.105-3.134 2-7 2s-7-.895-7-2m14 0v4.937C16 22.076 12.866 23 9 23s-7-.923-7-2.063V16m14 0c3.824 0 7-.987 7-2V4M9 14c-3.866 0-7 .895-7 2m7-2c-4.418 0-8-.987-8-2V7m8-2c-4.418 0-8 .895-8 2m0 0c0 1.105 3.582 2 8 2 0 1.013 3.253 2 7.077 2S23 10.013 23 9m0-5c0-1.105-3.1-2-6.923-2s-6.923.895-6.923 2M23 4c0 1.105-3.1 2-6.923 2s-6.923-.895-6.923-2m0 0v10.166"
      />
    </svg>
  );
}
