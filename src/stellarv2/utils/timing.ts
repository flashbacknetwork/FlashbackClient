declare const self: typeof globalThis;
declare const window: typeof globalThis;
declare const global: typeof globalThis;

const getGlobalThis = (): typeof globalThis => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw new Error("Unable to locate global object");
};

export const sleep = (ms: number): Promise<void> => {
  const globalScope = getGlobalThis();
  return new Promise((resolve) => globalScope.setTimeout(resolve, ms));
};
