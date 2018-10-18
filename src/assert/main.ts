
import get from "lodash/get";
import { Types } from "../core";
import { AbstractConstructor } from "../metadata/base";
import { assertTypeCoreDefine, IPropertyAssertPayload } from "./custom";
import { IAssertErrors, TypeDefine } from "../metadata";
import { errorReader } from "./handler";
import { assertPrimitiveDefine, assertNullableDefine } from "./primitive";

export interface ICommonTypeAssertPayload extends IPropertyAssertPayload { }

export function assertType<T>(type: AbstractConstructor<T> | null, value: any, more?: ICommonTypeAssertPayload): IAssertErrors | true {
  const define = Types.resolve(type);
  if (define === null) return true;
  return assertTypeDefine(define, value, more);
}

function assertTypeDefine<T>(define: TypeDefine<T>, value: any, more?: ICommonTypeAssertPayload): IAssertErrors | true {
  const E: IAssertErrors = { target: define.constructor, errors: [] };
  let result = assertNullableDefine(value);
  if (result !== true) {
    E.errors.push(result);
    return E;
  }
  result = assertPrimitiveDefine(define, value);
  if (result !== true) {
    E.errors.push(result);
    return E;
  }
  const e = assertTypeCoreDefine(define, value, more);
  if (e.errors.length > 0) E.errors.push(e);
  if (E.errors.length > 0) {
    errorReader(E);
    return E;
  }
  return true;
}

export type CommonTypeAssertFunction = typeof assertType;