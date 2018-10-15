
export type AbstractConstructor<T> = Function & { prototype: T };

export interface Constructor<T> {
  new(...args: any[]): T;
}
