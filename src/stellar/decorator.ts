import { ClientContext } from './client.js';

export function requiresSignature(
  target: any,
  propertyKey: string | symbol,
  descriptor?: PropertyDescriptor
): any {
  if (descriptor) {
    // Method decorator
    const originalMethod = descriptor.value;
    descriptor.value = function (this: { getContext: () => ClientContext }, ...args: any[]) {
      const context = this.getContext();
      if (!context.signTransaction) {
        throw new Error(
          'FlashOnStellarClient: signTransaction method is required for write operations'
        );
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  }

  // Property decorator (for arrow functions)
  const propertyDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    get(this: { getContext: () => ClientContext }) {
      const value = target[propertyKey];
      return (...args: any[]) => {
        const context = this.getContext();
        if (!context.signTransaction) {
          throw new Error(
            'FlashOnStellarClient: signTransaction method is required for write operations'
          );
        }
        return value.apply(this, args);
      };
    },
  };

  Object.defineProperty(target, propertyKey, propertyDescriptor);
}
