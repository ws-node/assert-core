import { DefineType, ExtendsFrom, Primitive, Types, List, assertType, Nullable, Complex } from "../src";
import { Assert } from "../src/assert";
import get = require("lodash/get");
import { ErrorLevel } from "../src/metadata/assert";

@DefineType()
abstract class TestBaseClass {

  @Primitive(String, "default")
  public abstract name: string;

}

@DefineType()
@ExtendsFrom(TestBaseClass)
abstract class TestClass extends TestBaseClass {

  @Primitive(Number, -1)
  public abstract value: number;

  @List(TestBaseClass)
  public abstract values: TestBaseClass[];

  @Complex(TestClass)
  @Nullable()
  public abstract cx: TestClass;

}

console.log(Array.from(Types.source.entries()));
setTimeout(() => {
  console.log("debug end");
}, 5000000);

const result = Assert.transform(TestClass, {
  name: "34524",
  value: 999,
  values: [{ name: "1342134" }],
  cx: {
    name: "123",
    value: 12,
    values: [
      { name: 12 },
      { name: false },
      { name: "123" }
    ],
    cx: {
      name: "34524",
      value: 543242,
      values: null
    }
  }
});

console.log(result.success);
console.log("------");
console.log(JSON.stringify(result.result, undefined, "  "));
console.log("------");
result.errors.forEach(i => console.log(i));

