import { Types } from "../core";
import { TypeDefineConstructor } from "../metadata";
import { TypeDefine } from "../metadata";
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
      strict: false,
      array: false,
      define: []
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

function PropertyFactory<P = any>(type?: TypeDefineConstructor<P> | TypeDefineConstructor<any>[]) {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target.constructor, propertyKey);
    const propertyCtor = type || Metadata.tryGetPropertyType(target, propertyKey);
    const defines: any[] = [];
    if (propertyCtor instanceof Array) {
      propertyCtor.forEach(p => {
        const def = tryGetType(p);
        if (def !== null) defines.push(def);
      });
    } else {
      const def = tryGetType(propertyCtor);
      if (def !== null) defines.push(def);
    }
    property.define.push(...defines);
  };
}

function ListFactory<P = any>(type?: TypeDefineConstructor<P> | TypeDefineConstructor<any>[]) {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target.constructor, propertyKey);
    property.array = true;
    PropertyFactory(type)(target, propertyKey, descriptor);
  };
}

function NullableFactory(strict = false) {
  return function defineProperty<T>(target: T, propertyKey: string, descriptor?: PropertyDescriptor) {
    const property = tryGetProperty(target.constructor, propertyKey);
    property.nullable = true;
    property.strict = !!strict;
  };
}

export {
  DefineTypeFactory as DefineType,
  ExtendsFromFactory as ExtendsFrom,
  NullableFactory as Nullable,
  PropertyFactory as Primitive,
  ListFactory as List
};
