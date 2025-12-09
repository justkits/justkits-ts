import type { IconProps } from "@icons/types";
export function Bat({ size = 24, color = "#000" }: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      color={color}
    >
      <g
        stroke="currentColor"
        strokeLinejoin="round"
        clipPath="url(#prefix__a)"
      >
        <path d="m3.64 13.333 10.064-7.54a2.492 2.492 0 1 0-3.497-3.498l-7.54 10.066" />
        <path d="m6.667 11.333-2-2m-.948 5.229c1.001-1.381-.888-3.288-2.28-2.279a.252.252 0 0 0-.031.385l1.925 1.924c.111.11.294.096.386-.03ZM12.333 14a1.667 1.667 0 1 1 0-3.333 1.667 1.667 0 0 1 0 3.333Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="currentColor" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
