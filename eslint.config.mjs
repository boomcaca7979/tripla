import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 第三方静态产物（Cesium 运行时，minified worker 与 chunk），
    // 非本站源码、不参与构建，仅随 public/ 原样分发。
    "public/cesium/**",
  ]),
]);

export default eslintConfig;
