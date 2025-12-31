type LogLevel = "info" | "warn" | "error" | "debug"

type LogPayload = Record<string, unknown>

type Logger = {
  info: (message: string, payload?: LogPayload) => void
  warn: (message: string, payload?: LogPayload) => void
  error: (message: string, payload?: LogPayload) => void
  debug: (message: string, payload?: LogPayload) => void
}

function log(level: LogLevel, scope: string, message: string, payload?: LogPayload) {
  const entry = { level, scope, message, payload, ts: new Date().toISOString() }
  if (level === "error") {
    console.error(entry)
  } else if (level === "warn") {
    console.warn(entry)
  } else if (level === "debug") {
    console.debug(entry)
  } else {
    console.log(entry)
  }
}

export function getLogger(scope: string): Logger {
  return {
    info: (message, payload) => log("info", scope, message, payload),
    warn: (message, payload) => log("warn", scope, message, payload),
    error: (message, payload) => log("error", scope, message, payload),
    debug: (message, payload) => log("debug", scope, message, payload),
  }
}
