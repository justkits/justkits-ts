import type { IconProps } from "@icons/types";
export function ForumIcon({ size = 24, color = "#000" }: Readonly<IconProps>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      color={color}
    >
      <path
        fill="currentColor"
        d="M18.333 18.334 15 15H6.667q-.688 0-1.177-.489A1.6 1.6 0 0 1 5 13.334V12.5h9.167q.687 0 1.177-.489t.49-1.177V5h.832q.688 0 1.178.49.49.491.49 1.177zm-15-8.188.98-.979H12.5V3.334H3.333zm-1.666 4.021V3.334q0-.688.49-1.177.489-.49 1.176-.49H12.5q.687 0 1.177.49t.49 1.177v5.833q0 .687-.49 1.178-.489.49-1.177.489H5z"
      />
    </svg>
  );
}
