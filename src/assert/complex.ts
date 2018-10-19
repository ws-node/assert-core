import { IAssertInvokeMethod, AssertType } from "../metadata/assert";
import get from "lodash/get";

interface ComplexCheckOptions {
  isProperty: boolean;
  propertyName?: string;
  propertyValidator: IAssertInvokeMethod<{
    isProperty: boolean;
    propertyName?: string;
  }>;
}

export const ComplexValidator: IAssertInvokeMethod<ComplexCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    propertyValidator: selfValidator,
    isProperty,
    defaultValue
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  const propertyName = get(options, "propertyName", "") || "";
  if (!selfValidator) return true;
  const succ = selfValidator({
    hostDefine: define,
    hostValue: value,
    currentDefine: define,
    currentValue: value
  }, {
      thrower: handler,
      openTransform: transform,
      isProperty,
      propertyName
    });
  if (!succ) {
    handler.push({
      parent: hostDefine || null,
      message: "Type to be checked is not match the value type.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    if (!transform) return false;
    if (isProperty) hostValue[propertyName] = defaultValue;
  }
  return true;
};
