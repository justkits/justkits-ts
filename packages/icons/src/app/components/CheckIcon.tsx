import type { IconProps } from "@icons/types";
export function CheckIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M14.364 3.407a1 1 0 0 1 0 1.414l-7.495 7.496a1.066 1.066 0 0 1-1.509 0L1.636 8.593A1 1 0 1 1 3.05 7.18l3.064 3.064 6.835-6.836a1 1 0 0 1 1.415 0"
        clipRule="evenodd"
      />
    </svg>
  );
}
