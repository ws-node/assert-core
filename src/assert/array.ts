import get from "lodash/get";
import set from "lodash/set";
import { IAssertInvokeMethod, ErrorLevel } from "../metadata/assert";
import { Check } from "../utils";
import { PropertyCheckOptions } from "./main";

interface ArrayCheckOptions {
  isProperty: boolean;
  propertyName?: string;
  isArrayDefine: boolean;
  propertyValidator: IAssertInvokeMethod<PropertyCheckOptions>;
}

export const ArrayValidator: IAssertInvokeMethod<ArrayCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    propertyValidator: selfValidator,
    isProperty,
    defaultValue,
    isArrayDefine: isArray,
    onError
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  const propertyName = get(options, "propertyName", "") || "";
  const is = Check.isArray(value);
  if (!isArray && is) {
    handler.push({
      parent: hostDefine || null,
      message: "The type of value to be checked is not array, but exist valie is.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    if (!transform) return false;
  }
  if (isArray && !is) {
    handler.push({
      parent: hostDefine || null,
      message: "Value to be checked is not array, but type is array.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    if (!transform) return false;
    // if (isProperty) hostValue[propertyName] = defaultValue;
  }
  if (!selfValidator) return true;
  for (const key in (<any>value || [])) {
    const item = get(value, key, undefined);
    const result = selfValidator({
      hostValue: value,
      hostDefine: define,
      currentValue: item,
      currentDefine: define
    }, {
        thrower: handler,
        openTransform: transform,
        property: {
          name: propertyName,
          nullable: false,
          strict: false,
          array: false,
          defaultvalue: undefined,
          define
        },
        onError
      });
    if (!result) {
      if (!transform) return false;
      // 外部处理
      // (<any>value)[key] = defaultValue;
    }
  }
  return true;
};
