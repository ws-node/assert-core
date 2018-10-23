import get from "lodash/get";
import set from "lodash/set";
import { IAssertInvokeMethod, ErrorLevel } from "../metadata/assert";
import { Check } from "../utils";
import { CoreCheckOptions } from "./main";

interface ArrayCheckOptions {
  isProperty: boolean;
  propertyName?: string;
  propertyValidator: IAssertInvokeMethod<CoreCheckOptions>;
}

export const ArrayValidator: IAssertInvokeMethod<ArrayCheckOptions> = (context, options) => {
  const {
    record: handler,
    openTransform: transform,
    propertyValidator: selfValidator,
    onError
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  const propertyName = get(options, "propertyName", "") || "";
  const isArray = get(hostDefine, `properties['${propertyName}'].array`, false);
  // console.log(`(${hostDefine === define}) [${propertyName}] is array : [${isArray}]`);
  const is = Check.isArray(value);
  if (!isArray && is) {
    handler.push({
      parent: hostDefine || null,
      message: "非数组类型不可以接受一个数组对象。",
      existValue: value,
      shouldDefine: define,
      level: ErrorLevel.TypeDismatch,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    if (!transform) return false;
  }
  if (isArray && !is) {
    handler.push({
      parent: hostDefine || null,
      message: "数组类型接受的对象不是数组。",
      existValue: value,
      shouldDefine: define,
      level: ErrorLevel.TypeDismatch,
      propertyName
    });
    onError({ type: ErrorLevel.TypeDismatch });
    if (!transform) return false;
    // if (isProperty) hostValue[propertyName] = defaultValue;
  }
  // 当前在对自己检查
  const isSelf = hostDefine === define;
  // 当前自身是array对象
  const isSelfArray = is;
  // 没有提供检查程序，或者当自身不是array时，不再继续向下检查
  if (!selfValidator || (isSelf && !isSelfArray)) return true;
  for (const key in (<any>value || [])) {
    const item = get(value, key, undefined);
    // console.log(`${propertyName}[${key}]`);
    const result = selfValidator({
      hostValue: value,
      hostDefine: define,
      currentValue: item,
      currentDefine: define
    }, {
        record: handler,
        openTransform: transform,
        onError,
        isProperty: true,
        propertyDefine: {
          null: { check: false, strict: false, nuulable: false },
          array: { check: true },
          primitive: { check: true }
        }
      });
    if (!result) {
      if (!transform) return false;
      // 外部处理
      // (<any>value)[key] = defaultValue;
    }
  }
  return true;
};
