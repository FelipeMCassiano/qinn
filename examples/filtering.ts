import { Enumerable } from "../src/qinn";

// first
const firstEven = Enumerable.from([1, 3, 4, 5]).first((x) => x % 2 === 0);
console.log(firstEven); // 4

// any
const hasEven = Enumerable.from([1, 3, 5, 8]).any((x) => x % 2 === 0);
console.log(hasEven); // true

// all
const allEven = Enumerable.from([1, 3, 5, 8]).all((x) => x % 2 === 0);
console.log(allEven); // false
