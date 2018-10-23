import { IAssertInvokeMethod, IAssertRecorder, IAssertError } from "../metadata/assert";

export const AssertInvoke: IAssertInvokeMethod = (context, options) => true;

export function createThrower(): IAssertRecorder {
  const errors: IAssertError[] = [];
  return {
    push(error: IAssertError) {
      errors.push(error);
    },
    show() { return errors; }
  };
}
