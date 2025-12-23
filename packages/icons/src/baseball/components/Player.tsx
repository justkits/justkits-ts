import type { IconProps } from "@icons/types";
export function Player({ size = 24, color = "#000" }: Readonly<IconProps>) {
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
        d="M9.6 3.733a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0M6.4.3A.3.3 0 0 0 6.101 0a.53.53 0 0 0-.266.17L3.2 4.897a.5.5 0 0 0 0 .139c0 .165.133.298.299.298a.53.53 0 0 0 .277-.17L6.4.437A.5.5 0 0 0 6.4.3m6.293 14.848L9.6 6.816a.52.52 0 0 0-.512-.416H3.755a.533.533 0 1 0 0 1.067H6.4l1.547 2.677-4.555 4.917a.52.52 0 0 0-.192.406.533.533 0 0 0 .533.533.53.53 0 0 0 .352-.139l4.747-4.426 2.944 4.266a.54.54 0 0 0 .47.278.553.553 0 0 0 .554-.534.53.53 0 0 0-.107-.298"
      />
    </svg>
  );
}
