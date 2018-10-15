import { Constructor } from "./base";

type PrimitiveTypeConstructor<T> =
  T extends number ? typeof Number :
  T extends string ? typeof String :
  T extends boolean ? typeof Boolean :
  Constructor<T>;

export interface TypeDefine<T> {
  primitive: boolean;
  constructor: PrimitiveTypeConstructor<T>;
  nullable: boolean;
}

const x: TypeDefine<number> = {
  primitive: true,
  constructor: Number,
  nullable: false
};
