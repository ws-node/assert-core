import { AbstractConstructor, IPropertyAssertErrors, PropertyDefine, TypeDefine, ErrorLevel } from "../metadata";
import { Types } from "../core";
import { assertProperty } from "./property";
import { Check } from "../utils";
import get from "lodash/get";

export interface IPropertyAssertPayload {
  parent: any;
  keyName: string;
}

export function resolveExtends(props: any, extendsDefine: TypeDefine<any> | null): any {
  if (!extendsDefine || extendsDefine === null) return props;
  const properties = { ...(extendsDefine.properties), ...(props || {}), };
  return resolveExtends(properties, get(extendsDefine, "extends.define", null));
}

export function assertTypeCore<T>(type: AbstractConstructor<T> | null, value: any, more?: IPropertyAssertPayload): IPropertyAssertErrors {
  return assertTypeCoreDefine(Types.resolve(type), value, more);
}

export function assertTypeCoreDefine<T>(define: TypeDefine<T> | null, value: any, more?: IPropertyAssertPayload): IPropertyAssertErrors {
  const ctor = get(define, "constructor", null);
  const e: IPropertyAssertErrors = { target: ctor, errors: [] };
  if (define === null) return e;
  if (Check.isPrimitive(value)) {
    e.errors.push({
      level: ErrorLevel.Property,
      propertyKey: get(more, "keyName", "[unknown]"),
      parent: get(more, "parent", "[unknown]"),
      message: "Value to be checked is item of an array, but type is not matched.",
      exist: value,
      shouldType: [ctor]
    });
    return e;
  }
  let properties: { [key: string]: PropertyDefine<any> } = {};
  if (define.extends !== null) {
    properties = resolveExtends(properties, get(define, "extends.define", null));
  }
  properties = { ...properties, ...define.properties };
  Object.keys(properties).forEach((prop) => {
    const property: PropertyDefine<any> = properties[prop];
    const error = assertProperty(value, property, ctor);
    if (error !== true) {
      e.errors.push(...error.errors);
    }
  });
  return e;
}

export type CoreTypeAssertFunction = typeof assertTypeCore;
