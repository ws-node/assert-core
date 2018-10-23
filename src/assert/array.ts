import get from "lodash/get";
import set from "lodash/set";
import { IAssertInvokeMethod, ErrorLevel } from "../metadata/assert";
import { Check } from "../utils";
import { PropertyCheckOptions } from "./main";

interface ArrayCheckOptions {
  isProperty: boolean;
  propertyName?: string;
  propertyValidator: IAssertInvokeMethod<PropertyCheckOptions>;
}

export const ArrayValidator: IAssertInvokeMethod<ArrayCheckOptions> = (context, options) => {
  const {
    thrower: handler,
    openTransform: transform,
    propertyValidator: selfValidator,
    isProperty,
    defaultValue,
    onError
  } = options;
  const { hostValue, hostDefine, currentValue: value, currentDefine: define } = context;
  if (!define) return true;
  console.log([
    hostDefine,
    define
  ]);
  const propertyName = get(options, "propertyName", "") || "";
  const isArray = get(hostDefine, `properties['${propertyName}'].array`, false);
  console.log(`is array : [${isArray}]`);
  const is = Check.isArray(value);
  if (!isArray && is) {
    handler.push({
      parent: hostDefine || null,
      message: "非数组类型不可以接受一个数组对象。",
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
      message: "数组类型接受的对象不是数组。",
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
