import { IAssertInvokeMethod, AssertType, ErrorLevel } from "../metadata/assert";
import get from "lodash/get";
import set from "lodash/set";

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
    record: handler,
    openTransform: transform,
    propertyValidator: selfValidator,
    isProperty,
    defaultValue,
    onError
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
      record: handler,
      openTransform: transform,
      isProperty,
      propertyName,
      onError,
    });
  if (!succ) {
    handler.push({
      parent: hostDefine || null,
      message: "自定义类型和被检查的对象不匹配。",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    if (!transform) return false;
    // 外部处理
    // if (isProperty) set(hostValue, propertyName, defaultValue);
  }
  return true;
};
