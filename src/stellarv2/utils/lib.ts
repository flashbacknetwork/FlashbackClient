export type Environment = "node" | "browser";
/**
 * Detects the current runtime environment
 */
export function getEnvironment(): Environment {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return "browser";
  }
  return "node";
}

/**
 * Checks if the code is running in a browser environment
 */
export function isBrowser(): boolean {
  return getEnvironment() === "browser";
}

/**
 * Checks if the code is running in a Node.js environment
 */
export function isNode(): boolean {
  return getEnvironment() === "node";
}
