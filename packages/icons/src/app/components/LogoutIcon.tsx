import type { IconProps } from "@icons/types";
export function LogoutIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      width={size}
      height={size}
      color={color}
    >
      <g clipPath="url(#prefix__a)">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M3.223 1.824c2.08-.146 4.17-.146 6.25 0 .337.024.632.142.862.317a.714.714 0 0 0 .864-1.138A3.05 3.05 0 0 0 9.575.4a46 46 0 0 0-6.453 0C1.67.503.48 1.602.407 3.032a101.192 101.192 0 0 0 0 9.936c.072 1.43 1.262 2.53 2.715 2.633a46 46 0 0 0 6.453 0 3.04 3.04 0 0 0 1.624-.604.716.716 0 0 0-.062-1.199.71.71 0 0 0-.802.061c-.23.174-.526.293-.862.317-2.08.146-4.169.146-6.249 0-.815-.057-1.359-.65-1.39-1.279A98 98 0 0 1 1.714 8c0-1.68.041-3.32.12-4.897.031-.63.575-1.22 1.39-1.279m1.989 5.462h5.933V4.815a.714.714 0 0 1 1.037-.637c1.392.705 2.754 2.086 3.451 3.493a.71.71 0 0 1 0 .66c-.697 1.405-2.06 2.786-3.451 3.49a.714.714 0 0 1-1.037-.636v-2.47H5.211a.714.714 0 1 1 .002-1.43"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="currentColor" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
