import { Types } from "../core";
import { AbstractConstructor } from "../metadata/base";
import { TypeDefine, PrimitiveTypeConstructor } from "../metadata";
import { Metadata } from "../utils";

function tryGetType(prototype: any): TypeDefine<any>;
function tryGetType(prototype: any, allowNull: true): TypeDefine<any> | null;
function tryGetType(prototype: any, allowNull?: boolean) {
  let define = Types.get(prototype);
  if (allowNull) return define || null;
  if (!define) {
    define = {
      extends: null,
      constructor: null,
      properties: {}
    };
    Types.set(prototype, define);
  }
  return define;
}

function tryGetProperty(prototype: any, key: string) {
  const define = tryGetType(prototype);
  let property = define.properties[key];
  if (!property) {
    property = define.properties[key] = {
      name: key,
      nullable: false,
      define: {
        extends: null,
        constructor: null,
        properties: {}
      }
    };
    Types.set(prototype, define);
  }
  return property;
}

function DefineTypeFactory() {
  return function defineType<T>(target: AbstractConstructor<T>) {
    const define = tryGetType(target.prototype);
    define.constructor = target;
  };
}

function ExtendsFromFactory<E>(extendsTarget: AbstractConstructor<E>) {
  return function extendsFrom<T>(target: AbstractConstructor<T>) {
    const define = tryGetType(target.prototype);
    define.extends = tryGetType(extendsTarget.prototype, true);
  };
}

function PropertyFactory<P>(type?: PrimitiveTypeConstructor<P>) {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target, propertyKey);
    let ctor = Metadata.tryGetProperty(target, propertyKey);
    if (ctor === null) ctor = type;
    property.define = tryGetType(type && type.prototype);
  };
}

export {
  DefineTypeFactory as DefineType,
  ExtendsFromFactory as ExtendsFrom,
  PropertyFactory as Property
};
