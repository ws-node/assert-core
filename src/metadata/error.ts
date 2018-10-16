
export enum ErrorLevel {
  Property = "PROPERTY",
  Element = "ELEMENT"
}

export interface IError {
  level: ErrorLevel.Element;
  message: string;
  propertyKey?: string;
  parent?: any;
}

export interface IPropertyError {
  level: ErrorLevel.Property;
  message: string;
  propertyKey: string;
  parent: any;
  shouldType?: any;
  exist?: any;
}

export interface IAssertErrors {
  target: any;
  errors: (IError | IPropertyAssertErrors)[];
}

export interface IPropertyAssertErrors {
  target: any;
  errors: IPropertyError[];
}
