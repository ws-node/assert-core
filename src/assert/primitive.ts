import { Types } from "../core";
import { AbstractConstructor, ErrorLevel, IError, TypeDefine } from "../metadata";

export function assertPrimitive<T>(type: AbstractConstructor<T> | null, value: any): IError | true {
  const define = Types.resolve(type);
  if (define === null) return true;
  return assertPrimitiveDefine(define, value);
}

export function assertPrimitiveDefine<T>(define: TypeDefine<T>, value: any): IError | true {
  if (define.primitive) {
    const is = Types.checkPrimitive(value, define.constructor);
    if (is) return true;
    return {
      level: ErrorLevel.Element,
      message: "Type should be primitive, but value to checked is not."
    };
  }
  return true;
}

export function assertNullable<T>(type: AbstractConstructor<T> | null, value: any): IError | true {
  const define = Types.resolve(type);
  if (define === null) return true;
  return assertNullableDefine(value);
}

export function assertNullableDefine<T>(value: any): IError | true {
  if (value === undefined || value === null) {
    return {
      level: ErrorLevel.Element,
      message: "Value to be checked is null or undefined."
    };
  }
  return true;
}
