import { IAssertInvokeMethod, AssertType, ErrorLevel } from "../metadata/assert";
import get from "lodash/get";
import set from "lodash/set";
import { CoreCheckOptions } from "./main";
import { Check } from "../utils";

interface ComplexCheckOptions {
  isProperty: boolean;
  propertyName?: string;
  propertyValidator: IAssertInvokeMethod<CoreCheckOptions>;
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
  // 当前在对自己检查
  const isSelf = hostDefine === define;
  // 当前自身是对象
  const isSelfNull = Check.isNull(value);
  const isSelfObject = Check.isObject(value);
  // const isSelfArray = Check.isArray(value);
  // const isSelfPrimitive = Check.isPrimitive(value);
  if (isSelf && isSelfNull) return true;
  if (isSelf && !isSelfNull) {
    if (!isSelfObject) {
      handler.push({
        parent: hostDefine || null,
        message: "自定义类型和被检查的对象不匹配。",
        existValue: value,
        shouldDefine: define,
        level: ErrorLevel.TypeDismatch,
        propertyName
      });
      onError({ type: ErrorLevel.TypeDismatch });
      // if (!transform) return false;
      return false;
    }
  }
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
      propertyDefine: {
        null: { check: true, strict: false, nuulable: false },
        array: { check: false },
        primitive: { check: true }
      }
    });
  if (!succ) {
    handler.push({
      parent: hostDefine || null,
      message: "自定义类型和被检查的对象不匹配。",
      existValue: value,
      shouldDefine: define,
      level: ErrorLevel.TypeDismatch,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    // if (!transform) return false;
    return false;
    // 外部处理
    // if (isProperty) set(hostValue, propertyName, defaultValue);
  }
  return true;
};
