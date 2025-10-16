import { Enumerable } from "../src/qinn";

// distinct
const enumerable1 = Enumerable.from([1, 1, 2, 3, 3, 4]);
const distinct = enumerable1.distinct();
console.log(distinct.toArray()); // [1, 2, 3, 4]

// distinctBy
const people = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 20 },
    { name: "Carol", age: 20 },
];
const enumerable2 = Enumerable.from(people);
const distinctBy = enumerable2.distinctBy((p) => p.age);
console.log(distinctBy.toArray()); // [{ name: "Alice", age: 25 },{ name: "Bob", age: 20 }]
