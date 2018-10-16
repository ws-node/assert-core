import { TypeDefine } from "../metadata";

const TypeRelationMap = new Map<any, TypeDefine<any>>([
  [Number, { extends: null, constructor: Number, properties: {}, primitive: true }],
  [String, { extends: null, constructor: String, properties: {}, primitive: true }],
  [Boolean, { extends: null, constructor: Boolean, properties: {}, primitive: true }]
]);

const Types = {
  source: TypeRelationMap,
  get(target: any) {
    return TypeRelationMap.get(target) || null;
  },
  set<T>(target: any, value: TypeDefine<T>) {
    TypeRelationMap.set(target, value);
  },
  /** 检查定义是否为number、boolean和string类型 */
  isPrimitive(target: any) {
    return !target || target === Number || target === String || target === Boolean;
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
  /** 获取定义的map选择器 */
  getSelector(target: any) {
    return this.isPrimitive(target) ? target : target.prototype;
  }
};

export {
  Types
};
