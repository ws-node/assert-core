import { IAssertInvokeMethod, ErrorLevel } from "../metadata/assert";
import { Check } from "../utils";
import get from "lodash/get";
import set from "lodash/set";

interface ObjectCheckOptions {
  isProperty: boolean;
  propertyName?: string;
}

export const ObjectValidator: IAssertInvokeMethod<ObjectCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    isProperty,
    defaultValue,
    onError
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  const propertyName = get(options, "propertyName", "") || "";
  if (define.constructor === Object && !Check.isObject(value)) {
    handler.push({
      parent: hostDefine || null,
      message: "The Type of the value to be checked should be object, but exist value is not.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    // 类型不匹配，拒绝提供默认值处理逻辑
    // if (!transform) return false;
    // if (isProperty) set(hostValue, propertyName, defaultValue);
    // 直接挂掉
    return false;
  }
  return true;
};
