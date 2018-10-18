import {
  PropertyDefine,
  IPropertyAssertErrors,
  ErrorLevel,
  AbstractConstructor
} from "../metadata";
import get from "lodash/get";
import { Check } from "../utils";
import { Types } from "../core";
import { assertType as mainTypeAssert } from "./main";
import { assertTypeCore } from "./custom";

type CheckStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function decideSwitch(toCheck: any, property: PropertyDefine<any>, prestep?: number): CheckStep {
  const pStep = Number(prestep) || 0;
  if (pStep < 1 && Check.isNull(toCheck)) return 1;
  if (pStep < 2 && property.array) return 2;
  if (pStep < 3 && Check.isObject(toCheck)) return 3;
  if (pStep < 4 && Check.isPrimitive(toCheck)) return 4;
  if (pStep < 5) return 5;
  return 6;
}

export function assertProperty(
  globalValue: any,
  property: PropertyDefine<any>,
  parent: any
) {
  const toCheck = get(globalValue, property.name, undefined);
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
  for (const key in cvs) {
    const [propertyCtor, primitive] = cvs[key];
    const errors: IPropertyAssertErrors = { target: parent, errors: [] };
    finalError = doCheck({
      keyName: property.name,
      globalValue,
      primitive,
      toCheck,
      parent,
      property,
      e: errors,
      propertyCtor,
      propertyCtors
    });
    if (finalError.errors.length === 0) return true;
  }
  if (finalError.errors.length === 0) return true;
  return finalError;
}

function doCheck(commonScope: ICheckScope) {
  const { toCheck, property, e } = commonScope;
  const step = decideSwitch(toCheck, property);
  switch (step) {
    case 1:
      checkNull(commonScope); break;
    case 2:
      checkArray(commonScope); break;
    case 3:
      checkObject(commonScope); break;
    case 4:
      checkPrimitive(commonScope); break;
    case 5:
      checkCustom(commonScope); break;
    default: break;
  }
  return e;
}

interface ICheckScope {
  globalValue: any;
  keyName: string;
  toCheck: any;
  primitive: boolean;
  parent: any;
  property: PropertyDefine<any>;
  propertyCtor: any;
  propertyCtors: any[];
  e: IPropertyAssertErrors;
}

function checkNull({ globalValue, toCheck, parent, property, e, propertyCtors }: ICheckScope) {
  const is = property.nullable;
  if (!is) {
    return addNullError(e, property, parent, toCheck, propertyCtors);
  }
  if (property.strict && !(property.name in globalValue)) {
    return addStrictNullError(e, property, parent, toCheck, propertyCtors);
  }
  return true;
}

function checkArray({ toCheck, parent, property, e, propertyCtors, keyName }: ICheckScope) {
  const is = Check.isArray(toCheck);
  if (!is) {
    return addListTypeError(e, property, parent, toCheck, propertyCtors);
  }
  const itemType = get(property, "define[0].constructor", Object);
  for (const item of (toCheck || [])) {
    const result = mainTypeAssert(itemType, item, { parent, keyName });
    if (result !== true && result.errors.length > 0) {
      return addListItemTypeError(e, property, parent, item, [itemType]);
    }
  }
  return true;
}

function checkObject({ toCheck, parent, property, e, propertyCtor, propertyCtors }: ICheckScope) {
  if (propertyCtor !== Object) {
    return addObjectError(e, property, parent, toCheck, propertyCtors);
  }
  return true;
}

function checkPrimitive({ toCheck, primitive, parent, property, e, propertyCtor, propertyCtors }: ICheckScope) {
  if (!primitive) {
    return addNotPrimitiveError(e, property, parent, toCheck, propertyCtors);
  }
  const is = Types.checkPrimitive(toCheck, propertyCtor);
  if (!is) {
    return addPrimitiveMismatchError(e, property, parent, toCheck, propertyCtors);
  }
  return true;
}

function checkCustom({ toCheck, parent, property, propertyCtor, propertyCtors, e }: ICheckScope) {
  const err = assertTypeCore(propertyCtor, toCheck);
  if (err.errors.length > 0) {
    return addTypeMismatchError(e, property, parent, toCheck, propertyCtors);
  }
  return true;
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

function addListItemTypeError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is item of an array, but type is not matched.",
    exist: toCheck,
    shouldType: propertyCtors
  });
  return e;
}

function addListTypeError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is not array, but type is array.",
    exist: toCheck,
    shouldType: propertyCtors
  });
  return e;
}

function addStrictNullError(e: IPropertyAssertErrors, property: PropertyDefine<any>, parent: any, toCheck: any, propertyCtors: any[]) {
  e.errors.push({
    level: ErrorLevel.Property,
    propertyKey: property.name,
    parent,
    message: "Value to be checked is undefined, but type is strict nullable.",
    exist: toCheck,
    shouldType: propertyCtors
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
