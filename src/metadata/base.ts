
export type AbstractConstructor<T> = Function & { prototype: T };

export interface Constructor<T> {
  new(...args: any[]): T;
}

export type PropertyDecorator = <T> (target: T, propertyKey: string, descriptor?: PropertyDescriptor) => void;
