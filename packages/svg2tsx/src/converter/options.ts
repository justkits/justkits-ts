import { Config } from "@svgr/core";
import jsxPlugin from "@svgr/plugin-jsx";
import svgoPlugin from "@svgr/plugin-svgo";

/**
 * SVGR 변환에 사용되는 기본 설정
 *
 * @example
 * ```typescript
 * import { defaultOptions } from "@justkits/svgs-core";
 *
 * // 기본 옵션 그대로 사용
 * const builder = new FamilySvgBuilder(defaultOptions, baseDir);
 *
 * // 기본 옵션을 확장하여 사용
 * const customOptions = {
 *   ...defaultOptions,
 *   template: myCustomTemplate,
 * };
 * ```
 */
export const defaultOptions: Config = {
  icon: true,
  typescript: true,
  jsxRuntime: "automatic",
  expandProps: false,
  plugins: [svgoPlugin, jsxPlugin],
  svgProps: {
    width: "{size}",
    height: "{size}",
    color: "{color}",
  },
};
