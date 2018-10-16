import {
  PropertyDefine,
  IPropertyAssertErrors,
  ErrorLevel,
  AbstractConstructor
} from "../metadata";
import { Check } from "../utils";
import { Types } from "../core";

export function assertProperty(
  value: any,
  property: PropertyDefine<any>,
  parent: any,
  assertType: (type: AbstractConstructor<any> | null, value: any) => IPropertyAssertErrors
) {
  const defines = property.define;
  let finalError: IPropertyAssertErrors = { target: parent, errors: [] };
  if (defines.length === 0) {
    finalError.errors.push({
      level: ErrorLevel.Property,
      propertyKey: property.name,
      parent,
      message: "Value to be checked is primitive, but type is not defined."
    });
    return finalError;
  }
  const cvs = defines.map<[any, boolean]>(i => [i.constructor, i.primitive]);
  const propertyCtors = cvs.map(c => c[0]);
  const toCheck = value;
  for (const key in cvs) {
    if (Number(key) > 0 && finalError.errors.length === 0) return true;
    const e: IPropertyAssertErrors = { target: parent, errors: [] };
    const [propertyCtor, primitive] = cvs[key];
    if (Check.isNull(toCheck)) {
      const is = property.nullable;
      if (!is) {
        finalError = addNullError(e, property, parent, toCheck, propertyCtors);
        continue;
      }
    } else {
      if (property.array) {
        const is = Check.isArray(toCheck);
        if (!is) {
          finalError = addListError(e, property, parent, toCheck, propertyCtors);
          continue;
        }
      }
      if (Check.isObject(toCheck)) {
        if (propertyCtor !== Object) {
          finalError = addObjectError(e, property, parent, toCheck, propertyCtors);
          continue;
        }
      } else if (Check.isPrimitive(toCheck)) {
        if (!primitive) {
          finalError = addNotPrimitiveError(e, property, parent, toCheck, propertyCtors);
          continue;
        }
        const is = Types.checkPrimitive(toCheck, propertyCtor);
        if (!is) {
          finalError = addPrimitiveMismatchError(e, property, parent, toCheck, propertyCtors);
          continue;
        }
      } else {
        const e = assertType(propertyCtor, toCheck);
        if (e.errors.length > 0) {
          finalError = addTypeMismatchError(e, property, parent, toCheck, propertyCtors);
          continue;
        }
      }
    }
  }
  return finalError;
}

function addTypeMismatchError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Type to be checked is not match the value type.",
    exist: toCheck,
    shouldType: propertyCtors
  }, ...(e.errors));
  return e;
}

function addPrimitiveMismatchError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is primitive, but type is not match the value.",
    exist: toCheck,
    shouldType: propertyCtors
  });
  return e;
}

function addNotPrimitiveError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is primitive, but type is not primitive.",
    exist: toCheck,
    shouldType: propertyCtors
  });
  return e;
}

function addObjectError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is object, but type is not object.",
    exist: toCheck,
    shouldType: propertyCtors
  });
  return e;
}

function addListError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is not array, but type is array.",
    exist: toCheck,
    shouldType: [Array, ...propertyCtors]
  });
  return e;
}

function addNullError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is null or undefined, but type is not nullable.",
    exist: toCheck,
    shouldType: propertyCtors
  });
  return e;
}
