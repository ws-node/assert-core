import { IAssertInvokeMethod, ErrorLevel } from "../metadata/assert";
import { Types } from "../core";
import get from "lodash/get";
import set from "lodash/set";
import { Check } from '../utils';

interface PrimitiveCheckOptions {
  isProperty: boolean;
  propertyName?: string;
}

export const PrimitiveValidator: IAssertInvokeMethod<PrimitiveCheckOptions> = (context, options) => {
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
  const isPrimitiveType = Types.isPrimitive(define.constructor);
  const is = Types.checkPrimitive(value, define.constructor);
  // console.log(options);
  if (isPrimitiveType && !is) {
    handler.push({
      parent: hostDefine || null,
      message: "Value to be checked is primitive, but type is not match the value.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    // 类型不匹配，拒绝提供默认值处理逻辑
    // if (!transform) return false;
    // if (isProperty) set(hostValue, propertyName, defaultValue);
    return false;
  }
  if (!isPrimitiveType && Check.isPrimitive(value)) {
    handler.push({
      parent: hostDefine || null,
      message: "Type of value to be checked is not primitive, but exist value is primitive.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    // 类型不匹配，拒绝提供默认值处理逻辑
    // if (!transform) return false;
    // if (isProperty) set(hostValue, propertyName, defaultValue);
    return false;
  }
  return true;
};
