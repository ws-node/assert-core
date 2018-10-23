import { IAssertInvokeMethod, ErrorLevel } from "../metadata/assert";
import { Types } from "../core";
import get from "lodash/get";
import set from "lodash/set";
import { Check } from "../utils";

interface PrimitiveCheckOptions {
  isProperty: boolean;
  propertyName?: string;
}

export const PrimitiveValidator: IAssertInvokeMethod<PrimitiveCheckOptions> = (context, options) => {
  const {
    record: handler,
    openTransform: transform,
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
      message: "被检查的不可变值和要求的类型不匹配。",
      existValue: value,
      shouldDefine: define,
      level: ErrorLevel.TypeDismatch,
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
      message: "要求一个非不可变对象，但实际得到一个不可变值。",
      existValue: value,
      shouldDefine: define,
      level: ErrorLevel.TypeDismatch,
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
