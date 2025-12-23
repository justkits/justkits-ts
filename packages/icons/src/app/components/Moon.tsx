import type { IconProps } from "@icons/types";
export function Moon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M7.154 5.942c0-1.547.227-3.11.808-4.442C4.103 3.18 1.5 7.12 1.5 11.596 1.5 17.618 6.382 22.5 12.404 22.5c4.476 0 8.417-2.603 10.096-6.462-1.332.58-2.897.808-4.442.808-6.022 0-10.904-4.882-10.904-10.904"
      />
    </svg>
  );
}
