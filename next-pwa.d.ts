declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PwaOptions = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: RegExp[];
    runtimeCaching?: Array<Record<string, unknown>>;
  };

  export default function withPWA(options: PwaOptions): (config: NextConfig) => NextConfig;
}
