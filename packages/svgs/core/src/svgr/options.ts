import { Config } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";

export const defaultOptions: Config = {
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
    ],
  },
};
