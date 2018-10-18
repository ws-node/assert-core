import { AbstractConstructor } from "./base";

export type PrimitiveTypeConstructor<T> =
  T extends Number ? typeof Number :
  T extends String ? typeof String :
  T extends Boolean ? typeof Boolean :
  T extends Object ? typeof Object :
  null;

export type TypeDefineKey<T> = { prototype: T } | PrimitiveTypeConstructor<T>;
export type TypeDefineConstructor<T> = AbstractConstructor<T> | PrimitiveTypeConstructor<T>;

export interface PropertyDefine<T = any> {
  name: string;
  nullable: boolean;
  strict: boolean;
  array: boolean;
  define: Array<TypeDefine<T>>;
}

export interface ExtendsDefine<T> {
  target: any;
  define: TypeDefine<T> | null;
}

export interface TypeDefine<T> {
  extends: ExtendsDefine<any> | null;
  constructor: TypeDefineConstructor<T>;
  properties: { [prop: string]: PropertyDefine };
  primitive: boolean;
}

const x: TypeDefine<number> = {
  extends: null,
  constructor: Number,
  properties: {},
  primitive: true
};
