import type { IconProps } from "@icons/types";
export function Album({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        fill="currentColor"
        d="m7.35 7.69-.683-1.023-1.334 2h6L9 5.333zM6.335 6a1.002 1.002 0 1 0 0-2.004 1.002 1.002 0 0 0 0 2.004"
      />
      <path
        fill="currentColor"
        d="M12.667 1.333H4c-.804 0-2 .533-2 2v9.334c0 1.467 1.196 2 2 2h10v-1.334H4.008c-.308-.008-.675-.129-.675-.666 0-.538.367-.659.675-.667H14V2.667c0-.736-.598-1.334-1.333-1.334m0 9.334H3.333V3.333c0-.537.367-.658.667-.666h8.667z"
      />
    </svg>
  );
}
