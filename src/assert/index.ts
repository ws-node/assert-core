import { createThrower } from "./base";
import { TypeDefineConstructor } from "../metadata";
import { IndexValidator } from "./main";
import { Types } from "..";
import { IAssertError, ErrorLevel } from "../metadata/assert";
import get from "lodash/get";

function errorsReader(errors: IAssertError[]): string[] {
  return (errors || []).sort((a, b) => {
    return a.level === ErrorLevel.NullDismatch ? -1 : 1;
  }).map(
    i => `${
      i.level === ErrorLevel.NullDismatch ? "WARNING" : "ERROR"
      } in [${
      get(i, "parent.constructor.name", "--")
      }]: => ${
      i.message
      } #(${i.propertyName || "[unknown]"})# @should: ${
      get(i, "shouldDefine.constructor.name", "--")
      } -> @exist: ${
      JSON.stringify(get(i, "existValue"))
      }`
  );
}

export const Assert = {
  valid<T>(type: TypeDefineConstructor<T>, value: any) {
    const handler = createThrower();
    IndexValidator({
      hostValue: value,
      currentValue: value,
      hostDefine: <any>Types.resolve(type),
      currentDefine: <any>Types.resolve(type)
    }, { openTransform: false, record: handler, onError: () => { } });
    const errors = handler.show();
    if (errors.length === 0) {
      return { success: true, errors: [], result: value };
    } else {
      return { success: false, errors: errorsReader(errors), result: value };
    }
  },
  transform<T>(type: TypeDefineConstructor<T>, value: any) {
    const handler = createThrower();
    IndexValidator({
      hostValue: value,
      currentValue: value,
      hostDefine: <any>Types.resolve(type),
      currentDefine: <any>Types.resolve(type)
    }, { openTransform: true, record: handler, onError: () => { } });
    const errors = handler.show();
    if (errors.length === 0) {
      return { success: true, errors: [], result: value };
    } else {
      return { success: false, errors: errorsReader(errors), result: value };
    }
  }
};
