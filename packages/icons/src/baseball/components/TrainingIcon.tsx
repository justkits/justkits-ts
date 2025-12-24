import type { IconProps } from "@icons/types";
export function TrainingIcon({
  size = 24,
  color = "#000",
}: Readonly<IconProps>) {
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
        d="m9.907 2.287-.954-.954L8 2.287l2.38 2.38-5.713 5.713L2.287 8l-.954.953.954.954-.954.953 1.427 1.427-.953.953.953.953.953-.953 1.427 1.427.953-.954.954.954.953-.954-2.38-2.38 5.713-5.713L13.713 8l.954-.953-.954-.954.954-.953-1.427-1.427.953-.953-.953-.953-.953.953-1.427-1.427z"
      />
    </svg>
  );
}
