import { SVGProps } from "react";

export const Path = (props: SVGProps<SVGPathElement>) => <path {...props} />;
export const Circle = (props: SVGProps<SVGCircleElement>) => (
  <circle {...props} />
);
export const Rect = (props: SVGProps<SVGRectElement>) => <rect {...props} />;
export const G = (props: SVGProps<SVGGElement>) => <g {...props} />;
export const Defs = (props: SVGProps<SVGDefsElement>) => <defs {...props} />;
export const ClipPath = (props: SVGProps<SVGClipPathElement>) => (
  <clipPath {...props} />
);

interface SvgProps extends SVGProps<SVGSVGElement> {
  testID?: string;
}

function Svg({ children, testID, ...props }: Readonly<SvgProps>) {
  return (
    <svg data-testid={testID} {...props}>
      {children}
    </svg>
  );
}

export default Svg;
