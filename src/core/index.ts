import { TypeDefine } from "../metadata/type";

const TypeRelationMap = new Map<any, TypeDefine<any>>([
  [Number, { extends: null, constructor: Number, properties: {} }],
  [String, { extends: null, constructor: String, properties: {} }],
  [Boolean, { extends: null, constructor: Boolean, properties: {} }]
]);

export {
  TypeRelationMap as Types
};
