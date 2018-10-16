import { DefineType, ExtendsFrom, Property, Types, assertType } from "../src";

@DefineType()
abstract class TestBaseClass {

  @Property()
  public abstract name: string | boolean;

}

@DefineType()
@ExtendsFrom(TestBaseClass)
abstract class TestClass extends TestBaseClass {

  // @Property()
  // public abstract name: string;

  @Property()
  public abstract value: number;

}

console.log(Array.from(Types.source.entries()));
setTimeout(() => {
  console.log("debug end");
}, 5000000);

const result = assertType(TestClass, {
  name: 123,
  value: false
});
console.log(result);
