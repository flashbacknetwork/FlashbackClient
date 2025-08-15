/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientContext } from "../client";

export function withSignature<T extends (...args: any[]) => Promise<any>>(
  method: T,
): T {
  return async function (
    this: { getContext?: () => ClientContext; context?: ClientContext },
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    // Try to get context from either getContext method or context property
    let context: ClientContext;
    if (this.getContext) {
      context = this.getContext();
    } else if (this.context) {
      context = this.context;
    } else {
      throw new Error(
        "FlashOnStellarClient: getContext method or context property is required for write operations",
      );
    }
    
    if (!context.signTransaction) {
      throw new Error(
        "FlashOnStellarClient: signTransaction method is required for write operations",
      );
    }
    return method.apply(this, args);
  } as T;
}

// For arrow functions/properties
export function withSignatureProperty<
  T extends (...args: any[]) => Promise<any>,
>(target: any, propertyKey: string | symbol) {
  const value = target[propertyKey];
  Object.defineProperty(target, propertyKey, {
    configurable: true,
    enumerable: true,
    get(this: { getContext?: () => ClientContext; context?: ClientContext }) {
      return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        // Try to get context from either getContext method or context property
        let context: ClientContext;
        if (this.getContext) {
          context = this.getContext();
        } else if (this.context) {
          context = this.context;
        } else {
          throw new Error(
            "FlashOnStellarClient: getContext method or context property is required for write operations",
          );
        }
        
        if (!context.signTransaction) {
          throw new Error(
            "FlashOnStellarClient: signTransaction method is required for write operations",
          );
        }
        return value.apply(this, args);
      };
    },
  });
}
