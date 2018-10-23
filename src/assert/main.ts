import get from "lodash/get";
import set from "lodash/set";
import { IAssertInvokeMethod, IAssertContext, ErrorLevel } from "../metadata/assert";
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

interface IDoCheckScope {
  context: IAssertContext;
  property: PropertyDefine<any>;
  transform: boolean;
  record: any;
  onError: (error: any) => void;
}

function doCheck(scope: IDoCheckScope) {
  const { context, property, transform, record, onError } = scope;
  const step = decideSwitch(context.currentValue, property);
  const common = {
    isProperty: true,
    defaultValue: property.defaultvalue,
    propertyName: property.name,
    openTransform: transform,
    record,
    onError
  };
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

export const IndexValidator: IAssertInvokeMethod<{}> = (context, options) => {
  const { } = options;
  const {
    currentDefine: define
  } = context;
  if (!define) return true;
  const result = CoreValidator(context, {
    ...options,
    isProperty: false,
    propertyDefine: {
      null: { check: true, strict: false, nuulable: false },
      array: { check: true },
      primitive: { check: true }
    }
  });
  if (!result) return false;
  return true;
};

export interface CoreCheckOptions {
  isProperty: boolean;
  propertyName?: string;
  propertyDefine?: {
    null: {
      check: boolean;
      strict: boolean;
      nuulable: boolean;
    };
    primitive: {
      check: boolean;
    };
    array: {
      check: boolean;
    }
  };
}

export const CoreValidator: IAssertInvokeMethod<CoreCheckOptions> = (context, options) => {
  const {
    record: handler,
    openTransform: transform,
    isProperty
  } = options;
  const {
    hostValue,
    currentValue: value,
    currentDefine: define
  } = context;

  const checkArray = get(options, "propertyDefine.array.check", false);
  const checkPrimitive = get(options, "propertyDefine.primitive.check", true);
  const checkNull = get(options, "propertyDefine.null.check", true);

  if (!define) return true;
  let result = true;
  if (checkNull) {
    const strict = get(options, "propertyDefine.null.strict", true);
    const nullable = get(options, "propertyDefine.null.nullable", true);
    result = NullValidator(context, { ...options, strict, nullable, isProperty });
    if (!result) return false;
  }
  if (checkPrimitive) {
    result = PrimitiveValidator(context, options);
    if (!result) return false;
  }
  if (checkArray) {
    result = ArrayValidator(context, { ...options, propertyValidator: CoreValidator });
    if (!result) return false;
  }
  let properties: { [key: string]: PropertyDefine<any> } = {};
  if (define.extends !== null) {
    properties = resolveExtends(properties, get(define, "extends.define", null));
  }
  properties = { ...properties, ...define.properties };
  Object.keys(properties).forEach((prop) => {
    const property: PropertyDefine<any> = properties[prop];
    const propertValue = get(value, property.name, undefined);
    result = PropertyValidator({
      hostValue: value,
      hostDefine: define,
      currentValue: propertValue,
      currentDefine: property.define === null ? undefined : property.define
    }, {
        property,
        record: handler,
        openTransform: transform,
        onError: ({ type }) => {
          if (type === ErrorLevel.NullDismatch && transform) {
            set(hostValue, property.name, property.defaultvalue);
          }
        }
      });
    if (!result && !transform) return false;
  });
  return true;
};

export interface PropertyCheckOptions<P = any> {
  property: PropertyDefine<P>;
}

export const PropertyValidator: IAssertInvokeMethod<PropertyCheckOptions> = (context, options) => {
  const {
    record,
    openTransform: transform,
    property,
    onError
  } = options;
  const {
    currentDefine: define
  } = context;
  if (!define) return true;
  return doCheck({ context, property, transform, record, onError });
};
