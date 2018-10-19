import { IAssertInvokeMethod, IAssertThrower, IAssertError } from "../metadata/assert";

export const AssertInvoke: IAssertInvokeMethod = (context, options) => true;

export function createThrower(): IAssertThrower {
  const errors: IAssertError[] = [];
  return {
    push(error: IAssertError) {
      errors.push(error);
    },
    show() { return errors; }
  };
}
