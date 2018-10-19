import { IAssertInvokeMethod } from "../metadata/assert";
import { Types } from "../core";
import get from "lodash/get";

interface PrimitiveCheckOptions {
  isProperty: boolean;
  propertyName?: string;
}

export const PrimitiveValidator: IAssertInvokeMethod<PrimitiveCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    isProperty,
    defaultValue
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  const propertyName = get(options, "propertyName", "") || "";
  const is = Types.checkPrimitive(value, define.constructor);
  if (!is) {
    handler.push({
      parent: hostDefine || null,
      message: "Value to be checked is primitive, but type is not match the value.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    if (!transform) return false;
    if (isProperty) hostValue[propertyName] = defaultValue;
  }
  return true;
};
