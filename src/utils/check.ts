
function checkNull(value: any) {
  return value === undefined || value === null;
}

function checkPrimitive(value: any) {
  return typeof value === "number" || typeof value === "string" || typeof value === "boolean";
}

export const Check = {
  /** 检查undefined和null类型 */
  isNull: checkNull,
  /** 检查number， string和boolean类型 */
  isPrimitive: checkPrimitive
};
