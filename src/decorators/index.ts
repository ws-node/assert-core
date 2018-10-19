import { Types } from "../core";
import { TypeDefineConstructor, PrimitiveTypeConstructor, AbstractConstructor, DefaultValueType } from "../metadata";
import { PropertyDecorator } from "../metadata";
import { TypeDefine } from "../metadata";
import { Metadata } from "../utils";

const DEFAULT_UNDEFINED = "__undefined__";

function tryGetType(type: any): TypeDefine<any>;
function tryGetType(type: any, allowNull: true): TypeDefine<any> | null;
function tryGetType(type: any, allowNull?: boolean) {
  const selector = Types.getSelector(type);
  let define = Types.get(selector);
  if (allowNull) return define || null;
  if (!define) {
    define = {
      extends: null,
      constructor: null,
      properties: {},
      primitive: false
    };
    Types.set(selector, define);
  }
  return define;
}

function tryGetProperty(type: any, key: string) {
  const define = tryGetType(type);
  let property = define.properties[key];
  if (!property) {
    property = define.properties[key] = {
      name: key,
      nullable: false,
      strict: false,
      array: false,
      define: null,
      defaultvalue: undefined
    };
  }
  return property;
}

function DefineTypeFactory() {
  return function defineType<T>(target: TypeDefineConstructor<T>) {
    const define = tryGetType(target);
    define.constructor = target;
  };
}

function ExtendsFromFactory<E>(extendsTarget: TypeDefineConstructor<E>) {
  return function extendsFrom<T>(target: TypeDefineConstructor<T>) {
    const define = tryGetType(target);
    const selector = Types.getSelector(extendsTarget);
    define.extends = {
      target: selector,
      define: tryGetType(extendsTarget, true)
    };
  };
}

function PropertyFactory<P = any>(type?: TypeDefineConstructor<P>, defaultValue?: DefaultValueType<P>): PropertyDecorator {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target.constructor, propertyKey);
    const propertyCtor = type || Metadata.tryGetPropertyType(target, propertyKey);
    property.define = tryGetType(propertyCtor);
    if (defaultValue === DEFAULT_UNDEFINED) {
      property.defaultvalue = _resolveDefaultValue(propertyCtor);
    } else {
      property.defaultvalue = defaultValue;
    }
  };
}

function ListFactory<P = any>(type?: TypeDefineConstructor<P>): PropertyDecorator;
function ListFactory<P = any>(defaultValue?: DefaultValueType<P>): PropertyDecorator;
function ListFactory<P = any>(type: TypeDefineConstructor<P>, defaultValue: DefaultValueType<P>): PropertyDecorator;
function ListFactory(...args: any[]) {
  const { type, defaultValue } = _resolveTypeDefaultValue(...args);
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target.constructor, propertyKey);
    property.array = true;
    PropertyFactory(type, defaultValue)(target, propertyKey, descriptor);
  };
}

function PrimitiveFactory<P = any>(type?: PrimitiveTypeConstructor<P>): PropertyDecorator;
function PrimitiveFactory<P = any>(defaultValue?: DefaultValueType<P>): PropertyDecorator;
function PrimitiveFactory<P = any>(type: TypeDefineConstructor<P>, defaultValue: DefaultValueType<P>): PropertyDecorator;
function PrimitiveFactory(...args: any[]) {
  const { type, defaultValue } = _resolveTypeDefaultValue(...args);
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    PropertyFactory(type, defaultValue)(target, propertyKey, descriptor);
  };
}

function ComplexFactory<P = any>(type?: AbstractConstructor<P>) {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    PropertyFactory(type, undefined)(target, propertyKey, descriptor);
  };
}

function NullableFactory(strict = false) {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target.constructor, propertyKey);
    property.nullable = true;
    property.strict = !!strict;
  };
}

function _resolveTypeDefaultValue(...args: any[]) {
  let type = args[0];
  let defaultValue = args.length === 2 ? args[1] : DEFAULT_UNDEFINED;
  if (args.length === 1 && (!("name" in Object(type)) || typeof type !== "function")) {
    defaultValue = type;
    type = undefined;
  }
  return {
    type,
    defaultValue
  };
}

function _resolveDefaultValue<T>(ctor: TypeDefineConstructor<T>): any {
  switch (ctor) {
    case Number: return 0;
    case String: return "";
    case Boolean: return false;
    case Object: return {};
    default: return {};
  }
}

export {
  DefineTypeFactory as DefineType,
  ExtendsFromFactory as ExtendsFrom,
  NullableFactory as Nullable,
  PrimitiveFactory as Primitive,
  ListFactory as List,
  ComplexFactory as Complex
};
