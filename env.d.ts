/**
 * Types for server.ts only.
 * tsconfig.json checks site/app.ts and does not include this file.
 */

declare module "*.html" {
  const page: unknown;
  export default page;
}

declare const Bun: {
  serve(options: {
    hostname?: string;
    port?: number;
    development?: boolean;
    routes: Record<string, unknown>;
  }): {
    url: URL;
  };
};
