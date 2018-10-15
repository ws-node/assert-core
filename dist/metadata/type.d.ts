import { Constructor } from "./base";
declare type PrimitiveTypeConstructor<T> = T extends number ? typeof Number : T extends string ? typeof String : T extends boolean ? typeof Boolean : Constructor<T>;
export interface TypeDefine<T> {
    primitive: boolean;
    constructor: PrimitiveTypeConstructor<T>;
    nullable: boolean;
}
export {};
