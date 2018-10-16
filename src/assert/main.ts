
import get from "lodash/get";
import { Types } from "../core";
import { AbstractConstructor } from "../metadata/base";
import { assertProperty } from "./property";
import { IAssertErrors, ErrorLevel, IPropertyAssertErrors, TypeDefine, PropertyDefine } from "../metadata";
import { errorReader } from "./handler";

function resolveExtends(props: any, extendsDefine: TypeDefine<any> | null): any {
  if (!extendsDefine || extendsDefine === null) return props;
  const properties = { ...(extendsDefine.properties), ...(props || {}), };
  return resolveExtends(properties, get(extendsDefine, "extends.define", null));
}

function assertTypeCore<T>(type: AbstractConstructor<T> | null, value: any): IPropertyAssertErrors {
  const selector = Types.getSelector(type);
  const define = Types.get(selector);
  const ctor = get(define, "constructor", null);
  const e: IPropertyAssertErrors = { target: ctor, errors: [] };
  if (define === null) return e;
  let properties: { [key: string]: PropertyDefine<any> } = {};
  if (define.extends !== null) {
    properties = resolveExtends(properties, get(define, "extends.define", null));
  }
  properties = { ...properties, ...define.properties };
  Object.keys(properties).forEach((prop) => {
    const property: PropertyDefine<any> = properties[prop];
    const toCheck = get(value, property.name, undefined);
    const error = assertProperty(toCheck, property, ctor, assertTypeCore);
    if (error !== true) {
      e.errors.push(...error.errors);
    }
  });
  return e;
}


export function assertType<T>(type: AbstractConstructor<T> | null, value: any): IAssertErrors | true {
  const selector = Types.getSelector(type);
  const define = Types.get(selector);
  const E: IAssertErrors = { target: type, errors: [] };
  if (value === undefined || value === null) {
    E.errors.push({
      level: ErrorLevel.Element,
      message: "Value to be checked is null or undefined."
    });
    return E;
  }
  if (define === null) return true;
  if (define.primitive) {
    const is = Types.checkPrimitive(value, define.constructor);
    if (is) return true;
    E.errors.push({
      level: ErrorLevel.Element,
      message: "Type should be primitive, but value to checked is not."
    });
    return E;
  }
  let properties: { [key: string]: PropertyDefine<any> } = {};
  if (define.extends !== null) {
    properties = resolveExtends(properties, get(define, "extends.define", null));
  }
  properties = { ...properties, ...define.properties };
  const e = assertTypeCore(type, value);
  if (e.errors.length > 0) E.errors.push(e);
  if (E.errors.length > 0) {
    errorReader(E);
    return E;
  }
  return true;
}