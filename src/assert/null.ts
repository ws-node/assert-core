import { IAssertInvokeMethod, ErrorLevel } from "../metadata/assert";
import get from "lodash/get";
import set from "lodash/set";

interface NullCheckOptions {
  nullable: boolean;
  isProperty: boolean;
  strict?: boolean;
  propertyName?: string;
}

export const NullValidator: IAssertInvokeMethod<NullCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    defaultValue,
    nullable,
    strict,
    isProperty,
    onError
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  const propertyName = get(options, "propertyName", "") || "";
  if ((value === undefined || value === null) && !nullable) {
    handler.push({
      parent: hostDefine || null,
      message: "Value to be checked is null or undefined, but type is not nullable.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.NullDismatch });
    if (!transform) return false;
    // 外部处理
    // if (isProperty) set(hostValue, propertyName, defaultValue);
  }
  if (isProperty && !!strict && !(propertyName in Object(hostValue))) {
    handler.push({
      parent: hostDefine || null,
      message: "Value to be checked is undefined, but type is strict nullable.",
      existValue: value,
      shouldDefine: define,
      propertyName
    });
    onError({ type: ErrorLevel.NullDismatch });
    if (!transform) return false;
    // 外部处理
    // set(hostValue, propertyName, defaultValue);
  }
  return true;
};
