import "reflect-metadata";

function getPropertyType(target: any, propertyKey: string) {
  return Reflect.getOwnMetadata("design:type", target, propertyKey) || null;
}

export const Metadata = {
  tryGetProperty: getPropertyType
};
