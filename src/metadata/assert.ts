import { TypeDefine, PropertyDefine } from "./type";

export enum AssertType {
  All,
  Nullable,
  Primitive,
  Object,
  Array,
  Complex
}

interface ExtendableObject { [prop: string]: any; }

export interface IAssertContext<C = any, P = any> {
  hostValue: ExtendableObject;
  hostDefine?: TypeDefine<ExtendableObject>;
  currentValue: C;
  currentDefine?: TypeDefine<P>;
}

export interface IAssertBaseOptions {
  thrower: IAssertThrower;
  openTransform: boolean;
  defaultValue?: any;
}

export interface IAssertOptions<P = any> extends IAssertBaseOptions {
  validType: AssertType;
  parent?: TypeDefine<P>;
  propertyValidator?: IAssertInvokeMethod;
  isProperty: boolean;
}

export interface IAssertThrower {
  push(error: IAssertError): void;
  show(): IAssertError[];
}

export interface IAssertError<P = any, S = any, E = any> {
  parent: TypeDefine<P> | null;
  message: string;
  propertyName: string;
  shouldDefine: TypeDefine<S>;
  existValue: E;
}

export type IAssertInvokeMethod<OPTIONS extends ExtendableObject = {}> = <C = any, P = any>(context: IAssertContext<C, P>, options: OPTIONS & IAssertBaseOptions) => boolean;
