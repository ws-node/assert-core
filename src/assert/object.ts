import { IAssertInvokeMethod } from "../metadata/assert";
import { Check } from "../utils";
import get from "lodash/get";

interface ObjectCheckOptions {
  isProperty: boolean;
  propertyName?: string;
}

export const ObjectValidator: IAssertInvokeMethod<ObjectCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    isProperty,
    defaultValue
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  const propertyName = get(options, "propertyName", "") || "";
  if (define.constructor !== Object || !Check.isObject(value)) {
    handler.push({
      parent: hostDefine || null,
      message: "Value to be checked is object, but type is not object.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    if (!transform) return false;
    if (isProperty) hostValue[propertyName] = defaultValue;
  }
  return true;
};
