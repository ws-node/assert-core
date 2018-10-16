import { Types } from "../core";
import { AbstractConstructor } from "../metadata";
import { TypeDefine, PrimitiveTypeConstructor } from "../metadata";
import { Metadata } from "../utils";

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
      define: {
        extends: null,
        constructor: null,
        properties: {},
        primitive: false
      }
    };
  }
  return property;
}

function DefineTypeFactory() {
  return function defineType<T>(target: AbstractConstructor<T>) {
    const define = tryGetType(target);
    define.constructor = target;
  };
}

function ExtendsFromFactory<E>(extendsTarget: AbstractConstructor<E>) {
  return function extendsFrom<T>(target: AbstractConstructor<T>) {
    const define = tryGetType(target);
    const selector = Types.getSelector(extendsTarget);
    define.extends = {
      target: selector,
      define: tryGetType(extendsTarget, true)
    };
  };
}

function PropertyFactory<P>(type?: PrimitiveTypeConstructor<P>) {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target.constructor, propertyKey);
    let propertyCtor = Metadata.tryGetPropertyType(target, propertyKey);
    if (propertyCtor === null) propertyCtor = type;
    property.define = tryGetType(propertyCtor);
  };
}

export {
  DefineTypeFactory as DefineType,
  ExtendsFromFactory as ExtendsFrom,
  PropertyFactory as Property
};
