import type { IconProps } from "@icons/types";
export function InfoCircle({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 11v5m0 5a9 9 0 1 1 0-18 9 9 0 0 1 0 18m.05-13v.1h-.1V8z"
      />
    </svg>
  );
}
