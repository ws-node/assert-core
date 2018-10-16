import { DefineType, ExtendsFrom, Property, Types, List, assertType } from "../src";
import { IPropertyAssertErrors } from "../src/metadata";

@DefineType()
abstract class TestBaseClass {

  @Property([String, Number])
  public abstract name: string | number;

}

@DefineType()
@ExtendsFrom(TestBaseClass)
abstract class TestClass extends TestBaseClass {

  @Property()
  public abstract value: number;

  @List(Number)
  public abstract values: number[];

}

console.log(Array.from(Types.source.entries()));
setTimeout(() => {
  console.log("debug end");
}, 5000000);

const result = assertType(TestClass, {
  name: null,
  value: false
});
