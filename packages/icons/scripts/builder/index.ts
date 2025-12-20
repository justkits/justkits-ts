import { Config } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";

import { IconsBuilder } from "./core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function template(variables: any, { tpl }: any) {
  return tpl`
    ${variables.imports}
    import type { IconProps } from "@icons/types";

    export function ${variables.componentName}({ size = 24, color = "#000" }: Readonly<IconProps>) {
      return (${variables.jsx});
    }
  `;
}

const options: Config = {
  icon: true,
  typescript: true,
  prettier: true,
  jsxRuntime: "automatic",
  expandProps: false,
  plugins: [svgoPlugin, jsxPlugin],
  svgProps: {
    width: "{size}",
    height: "{size}",
    color: "{color}",
  },
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: { overrides: { removeViewBox: false } },
      },
      {
        name: "convertColors",
        params: { currentColor: true },
      },
      "prefixIds",
      "removeDimensions",
    ],
  },
  template,
};

const typesContent = `export type IconProps = {
  size?: number;
  color?: string;
};

`;

export const builder = new IconsBuilder(options, typesContent);
