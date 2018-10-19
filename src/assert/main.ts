import get from "lodash/get";
import { IAssertInvokeMethod, IAssertContext } from "../metadata/assert";
import { NullValidator } from "./null";
import { PrimitiveValidator } from "./primitive";
import { PropertyDefine, TypeDefine } from "../metadata";
import { Check } from "../utils";
import { ArrayValidator } from "./array";
import { ObjectValidator } from "./object";
import { ComplexValidator } from "./complex";

type CheckStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function decideSwitch(toCheck: any, property: PropertyDefine<any>, prestep?: number): CheckStep {
  const pStep = Number(prestep) || 0;
  const primitive = get(property, "define.primitive", false);
  const ctor = get(property, "define.constructor", null);
  if (pStep < 1 && Check.isNull(toCheck)) return 1;
  if (pStep < 2 && property.array) return 2;
  if (pStep < 3 && !primitive && ctor === Object) return 3;
  if (pStep < 4 && !!primitive) return 4;
  if (pStep < 5) return 5;
  return 6;
}

function doCheck(context: IAssertContext, property: PropertyDefine<any>, openTransform: boolean, thrower: any) {
  const step = decideSwitch(context.currentValue, property);
  const common = { isProperty: true, defaultValue: property.defaultvalue, propertyName: property.name, thrower, openTransform };
  switch (step) {
    case 1:
      return NullValidator(context, { ...common, nullable: property.nullable, strict: property.strict });
    case 2:
      return ArrayValidator(context, { ...common, propertyValidator: CoreValidator });
    case 3:
      return ObjectValidator(context, { ...common });
    case 4:
      return PrimitiveValidator(context, { ...common });
    case 5:
      return ComplexValidator(context, { ...common, propertyValidator: CoreValidator });
    default: return true;
  }
}

export function resolveExtends(props: any, extendsDefine: TypeDefine<any> | null): any {
  if (!extendsDefine || extendsDefine === null) return props;
  const properties = { ...(extendsDefine.properties), ...(props || {}), };
  return resolveExtends(properties, get(extendsDefine, "extends.define", null));
}

export const IndexValidator: IAssertInvokeMethod = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform
  } = options;
  const {
    currentDefine: define
  } = context;
  if (!define) return true;
  let result = NullValidator(context, { ...options, strict: false, nullable: false, isProperty: false });
  if (!result) return false;
  result = CoreValidator(context, { ...options, isProperty: false });
  if (!result) return false;
  return true;
};

interface CoreCheckOptions {
  isProperty: boolean;
  propertyName?: string;
}

export const CoreValidator: IAssertInvokeMethod<CoreCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform
  } = options;
  const {
    hostValue,
    currentValue: value,
    currentDefine: define
  } = context;

  if (!define) return true;
  let result = PrimitiveValidator(context, options);
  if (!result) return false;
  let properties: { [key: string]: PropertyDefine<any> } = {};
  if (define.extends !== null) {
    properties = resolveExtends(properties, get(define, "extends.define", null));
  }
  properties = { ...properties, ...define.properties };
  Object.keys(properties).forEach((prop) => {
    const property: PropertyDefine<any> = properties[prop];
    result = PropertyValidator({
      hostValue: value,
      hostDefine: define,
      currentValue: (<any>value)[property.name],
      currentDefine: property.define === null ? undefined : property.define
    }, {
        property,
        thrower: handler,
        openTransform: transform
      });
    if (!result && !transform) return false;
    hostValue[property.name] = property.defaultvalue;
  });
  return true;
};

interface PropertyCheckOptions<P = any> {
  property: PropertyDefine<P>;
}

export const PropertyValidator: IAssertInvokeMethod<PropertyCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    property
  } = options;
  const {
    currentDefine: define
  } = context;
  if (!define) return true;
  return doCheck(context, property, transform, handler);
};
