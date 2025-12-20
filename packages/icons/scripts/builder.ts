import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Config } from "@svgr/core";
import { FamilySvgBuilder, defaultOptions } from "@justkits/svgs-core";

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
  ...defaultOptions,
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

export const builder = new FamilySvgBuilder(
  options,
  join(dirname(fileURLToPath(import.meta.url)), ".."),
);
