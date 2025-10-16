import { Enumerable } from "../src/qinn";

// constructor
const enumerable = new Enumerable([1, 2, 3, 4]);
console.log(enumerable.toArray()); // [1, 2, 3, 4]

// from
const e = Enumerable.from([1, 2, 3, 4]);
console.log(e.toArray()); // [1, 2, 3, 4]

// range
const range = Enumerable.range(5, 3);
console.log(range.toArray()); // [5, 6, 7]

// empty

console.log(Enumerable.empty<number>().toArray()); // []
