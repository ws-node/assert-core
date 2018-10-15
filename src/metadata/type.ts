import { AbstractConstructor } from "./base";

export type PrimitiveTypeConstructor<T> =
  T extends number ? typeof Number :
  T extends string ? typeof String :
  T extends boolean ? typeof Boolean :
  AbstractConstructor<T> | null;

interface PropertyDefine<T = any> {
  name: string;
  nullable: boolean;
  define: TypeDefine<T>;
}

export interface TypeDefine<T> {
  extends: TypeDefine<any> | null;
  constructor: PrimitiveTypeConstructor<T>;
  properties: { [prop: string]: PropertyDefine };
}

const x: TypeDefine<number> = {
  extends: null,
  constructor: Number,
  properties: {}
};
