/**
 * Frontend logger — see LOGGING.md at repo root for the canonical contract.
 *
 * Same 5-level vocabulary as the backend (fatal/error/warn/info/debug),
 * but mechanism is different: no server-side log sink yet, so we just
 * use the browser console.
 *
 * In production builds:
 *   - debug / info / warn → no-op (stripped from output)
 *   - error / fatal → console.error (kept so future Sentry/RUM wiring catches it)
 *
 * In dev:
 *   - all five forward to the matching console.* method
 *
 * Usage:
 *   logger.error({ err }, "Failed to submit deal");      // kept in prod
 *   logger.debug({ payload }, "sending request");        // stripped in prod
 *
 * When you wire up Sentry/RUM later, change ONLY the error/fatal branches
 * to forward to it — one file to edit.
 */

const isProd = import.meta.env.PROD;

type Args =
  | [meta?: unknown, msg?: string, ...rest: unknown[]]
  | [msg: string, ...rest: unknown[]];

const noop = (..._: unknown[]): void => {};

const out =
  (lvl: "log" | "info" | "warn" | "error" | "debug") =>
  (...args: Args): void => {
    // eslint-disable-next-line no-console
    (console[lvl] as (...x: unknown[]) => void)(...args);
  };

export const logger = {
  fatal: out("error"),
  error: out("error"),
  warn: isProd ? noop : out("warn"),
  info: isProd ? noop : out("info"),
  debug: isProd ? noop : out("debug"),
};

export default logger;
