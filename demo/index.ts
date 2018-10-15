import { DefineType, ExtendsFrom, Property, Types } from "../src";

@DefineType()
abstract class TestBaseClass {

  @Property()
  public abstract name: string;

}

@DefineType()
@ExtendsFrom(TestBaseClass)
abstract class TestClass extends TestBaseClass {

  @Property()
  public abstract value: number;

}

console.log(Types);
setTimeout(() => {
  console.log("123456");
}, 50000);