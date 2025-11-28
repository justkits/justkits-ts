/* eslint-disable @typescript-eslint/no-explicit-any */

export const Path = (props: any) => <path {...props} />;
export const Circle = (props: any) => <circle {...props} />;
export const Rect = (props: any) => <rect {...props} />;
export const G = (props: any) => <g {...props} />;
export const Defs = (props: any) => <defs {...props} />;
export const ClipPath = (props: any) => <clipPath {...props} />;

function Svg({ children, testID, ...props }: any) {
  return (
    <svg data-testid={testID} {...props}>
      {children}
    </svg>
  );
}

export default Svg;
