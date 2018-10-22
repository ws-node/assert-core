import { createThrower } from "./base";
import { TypeDefineConstructor } from "../metadata";
import { IndexValidator } from "./main";
import { Types } from "..";

export const Assert = {
  valid<T>(type: TypeDefineConstructor<T>, value: any) {
    // const res = assertType(type, value, { useDefault: false });
    // if (res === true) {
    //   return { success: true, errors: null, result: value };
    // } else {
    //   return { success: false, errors: res, result: value };
    // }
    const handler = createThrower();
    IndexValidator({
      hostValue: value,
      currentValue: value,
      hostDefine: <any>Types.resolve(type),
      currentDefine: <any>Types.resolve(type)
    }, { openTransform: false, thrower: handler, onError: () => { } });
    const errors = handler.show();
    if (errors.length === 0) {
      return { success: true, errors: null, result: value };
    } else {
      return { success: false, errors, result: value };
    }
  },
  transform<T>(type: TypeDefineConstructor<T>, value: any) {
    // const res = assertType(type, value, { useDefault: true });
    // if (res === true) {
    //   return { success: true, errors: null, result: value };
    // } else {
    //   return { success: false, errors: res, result: value };
    // }
    const handler = createThrower();
    IndexValidator({
      hostValue: value,
      currentValue: value,
      hostDefine: <any>Types.resolve(type),
      currentDefine: <any>Types.resolve(type)
    }, { openTransform: true, thrower: handler, onError: () => { } });
    const errors = handler.show();
    if (errors.length === 0) {
      return { success: true, errors: null, result: value };
    } else {
      return { success: false, errors, result: value };
    }
  }
};
