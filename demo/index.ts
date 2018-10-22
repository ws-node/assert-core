import { DefineType, ExtendsFrom, Primitive, Types, List, assertType, Nullable, Complex } from "../src";
import { Assert } from "../src/assert";
import get = require("lodash/get");

@DefineType()
abstract class TestBaseClass {

  @Primitive(String, "default")
  public abstract name: string;

}

@DefineType()
@ExtendsFrom(TestBaseClass)
abstract class TestClass extends TestBaseClass {

  @Primitive(Number, -1)
  // @Nullable()
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
  value: 333,
  values: [{ name: "12" }],
  cx: {
    name: "123",
    value: 12,
    values: [
      { name: "12" },
      { name: "1234" },
      { name: "123" }
    ],
    cx: null
  }
});

console.log(result.success);
console.log(JSON.stringify(result.result));
(result.errors || []).map(
  i => console.log(`ERROR in [${
    get(i, "parent.constructor.name", "--")
    }]: => ${
    i.message
    } #(${i.propertyName || "[unknown]"})# @should: ${
    get(i, "shouldDefine.constructor.name", "--")
    } -> @exist: ${
    JSON.stringify(get(i, "existValue"))
    }`)
);

