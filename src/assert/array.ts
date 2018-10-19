import get from "lodash/get";
import { IAssertInvokeMethod, AssertType } from "../metadata/assert";
import { Check } from "../utils";

interface ArrayCheckOptions {
  isProperty: boolean;
  propertyName?: string;
  propertyValidator: IAssertInvokeMethod<{
    isProperty: boolean;
    propertyName?: string;
  }>;
}

export const ArrayValidator: IAssertInvokeMethod<ArrayCheckOptions> = (context, options) => {
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
  const is = Check.isArray(value);
  if (!is) {
    handler.push({
      parent: hostDefine || null,
      message: "Value to be checked is not array, but type is array.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    if (!transform) return false;
    if (isProperty) hostValue[propertyName] = defaultValue;
  }
  if (!selfValidator) return true;
  for (const key in (<any>value || [])) {
    const item = (<any>value)[key];
    const result = selfValidator({
      hostValue: value,
      hostDefine: define,
      currentValue: item,
      currentDefine: define
    }, {
        thrower: handler,
        openTransform: transform,
        propertyName,
        isProperty
      });
    if (!result) {
      if (!transform) return false;
      (<any>value)[key] = defaultValue;
    }
  }
  return true;
};
