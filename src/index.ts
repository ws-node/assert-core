export * from "./decorators";

import get from "lodash/get";
import { Types } from "./core";
import { AbstractConstructor } from "./metadata/base";
import { Check } from "./utils";
import { IAssertErrors, ErrorLevel, IPropertyAssertErrors, TypeDefine, PropertyDefine } from "./metadata";

function resolveExtends(props: any, extendsDefine: TypeDefine<any> | null): any {
  if (!extendsDefine || extendsDefine === null) return props;
  const properties = { ...(extendsDefine.properties), ...(props || {}), };
  return resolveExtends(properties, get(extendsDefine, "extends.define", null));
}

function assertType<T>(type: AbstractConstructor<T> | null, value: any): IAssertErrors | true {
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
  const e: IPropertyAssertErrors = { target: define.constructor, errors: [] };
  Object.keys(properties).forEach((prop) => {
    const property: PropertyDefine<any> = properties[prop];
    const propertyCtor = get(property, "define.constructor", null);
    if (property.define === null) {
      e.errors.push({
        level: ErrorLevel.Property,
        propertyKey: prop,
        parent: define.constructor,
        message: "Value to be checked is primitive, but type is not defined."
      });
    }
    const toCheck = get(value, property.name, undefined);
    if (Check.isNull(toCheck)) {
      const is = property.nullable;
      if (is) return true;
      e.errors.push({
        level: ErrorLevel.Property,
        propertyKey: prop,
        parent: define.constructor,
        message: "Value to be checked is null or undefined, but type is not nullable.",
        exist: toCheck,
        shouldType: propertyCtor
      });
    } else if (Check.isPrimitive(toCheck)) {
      if (!property.define.primitive) {
        e.errors.push({
          level: ErrorLevel.Property,
          propertyKey: prop,
          parent: define.constructor,
          message: "Value to be checked is primitive, but type is not premitive.",
          exist: toCheck,
          shouldType: propertyCtor
        });
      }
      const is = Types.checkPrimitive(toCheck, propertyCtor);
      if (is) return true;
      e.errors.push({
        level: ErrorLevel.Property,
        propertyKey: prop,
        parent: define.constructor,
        message: "Value to be checked is primitive, but type is not match the value.",
        exist: toCheck,
        shouldType: propertyCtor
      });
    } else {
      const is = assertType(propertyCtor, toCheck);
      if (is) return true;
      e.errors.push({
        level: ErrorLevel.Property,
        propertyKey: prop,
        parent: define.constructor,
        message: "Type to be checked is not match the value type.",
        exist: toCheck,
        shouldType: propertyCtor
      });
    }
  });
  if (e.errors.length > 0) E.errors.push(e);
  if (E.errors.length > 0) return E;
  return true;
}

export {
  Types,
  assertType
};
