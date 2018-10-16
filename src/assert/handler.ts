import { IAssertErrors, IPropertyAssertErrors } from "../metadata";

export function errorReader(error: IAssertErrors) {
  error.errors.forEach(i => {
    if ("target" in i) {
      console.log("-----------------");
      handler(i);
    } else {
      console.log("-----------------");
      console.log(`[${i.level}] : @${i.propertyKey} => ${i.message}`);
    }
  });
}

function handler(i: IPropertyAssertErrors) {
  i.errors.forEach(m => {
    if ("level" in m) {
      console.log(`[${m.level}] : @${m.propertyKey} => ${m.message} # should[${((m.shouldType && m.shouldType) || []).map(i => i.name).join(",")}] but got [${JSON.stringify(m.exist)}]`);
    } else {
      handler(m);
    }
  });
}
