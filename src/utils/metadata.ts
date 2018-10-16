import "reflect-metadata";

function getPropertyType(prototype: any, propertyKey: string) {
  return Reflect.getOwnMetadata("design:type", prototype, propertyKey) || null;
}

export const Metadata = {
  tryGetPropertyType: getPropertyType
};
