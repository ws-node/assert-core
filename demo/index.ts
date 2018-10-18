import { DefineType, ExtendsFrom, Primitive, Types, List, assertType, Nullable } from "../src";

@DefineType()
abstract class TestBaseClass {

  @Primitive([String, Number])
  public abstract name: string | number;

}

@DefineType()
@ExtendsFrom(TestBaseClass)
abstract class TestClass extends TestBaseClass {

  @Primitive(Number)
  @Nullable(true)
  public abstract value: number;

  @List(TestBaseClass)
  public abstract values: number[];

}

console.log(Array.from(Types.source.entries()));
setTimeout(() => {
  console.log("debug end");
}, 5000000);

const result = assertType(TestClass, {
  name: null,
  value: false,
  values: [{ name: 12 }, 1234, "1234"]
});
