import { TypeDefine, TypeDefineKey, TypeDefineConstructor } from "../metadata";
import get from "lodash/get";

const TypeRelationMap = new Map<TypeDefineKey<any>, TypeDefine<any>>([
  [Number, { extends: null, constructor: Number, properties: {}, primitive: true }],
  [String, { extends: null, constructor: String, properties: {}, primitive: true }],
  [Boolean, { extends: null, constructor: Boolean, properties: {}, primitive: true }],
  [Object, { extends: null, constructor: Object, properties: {}, primitive: false }]
]);

const Types = {
  source: TypeRelationMap,
  get<T>(key: TypeDefineKey<T>) {
    return TypeRelationMap.get(key) || null;
  },
  set<T>(key: any, value: TypeDefine<T>) {
    TypeRelationMap.set(key, value);
  },
  /** 检查定义是否为number、boolean和string类型 */
  isPrimitive<T>(key: TypeDefineConstructor<T>) {
    return !key || key === Number || key === String || key === Boolean;
  },
  /** 检查number、boolean和string类型值是否匹配类型 */
  checkPrimitive(value: any, type: any) {
    switch (type) {
      case Number: return typeof value === "number";
      case String: return typeof value === "string";
      case Boolean: return typeof value === "boolean";
      default: return false;
    }
  },
  isObject<T>(key: TypeDefineKey<T>) {
    return key && key === Object;
  },
  /** 获取定义的map选择器 */
  getSelector<T>(key: TypeDefineConstructor<T> | null) {
    return (this.isPrimitive(key) || this.isObject(key)) ? key : get(key, "prototype", null);
  },
  /** 解析类型定义 */
  resolve(key: any) {
    const selector = this.getSelector(key);
    return this.get(selector);
  }
};

export {
  Types
};
