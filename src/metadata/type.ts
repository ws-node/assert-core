import { AbstractConstructor } from "./base";

export type PrimitiveTypeConstructor<T> =
  T extends number ? typeof Number :
  T extends string ? typeof String :
  T extends boolean ? typeof Boolean :
  AbstractConstructor<T> | null;

export interface PropertyDefine<T = any> {
  name: string;
  nullable: boolean;
  define: TypeDefine<T>;
}

export interface ExtendsDefine<T> {
  target: any;
  define: TypeDefine<T> | null;
}

export interface TypeDefine<T> {
  extends: ExtendsDefine<any> | null;
  constructor: PrimitiveTypeConstructor<T>;
  properties: { [prop: string]: PropertyDefine };
  primitive: boolean;
}

const x: TypeDefine<number> = {
  extends: null,
  constructor: Number,
  properties: {},
  primitive: true
};
