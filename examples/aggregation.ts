import { Enumerable } from "../src/qinn";

// sum
const sum = Enumerable.from([1, 2, 3]).sum();
console.log(sum); // 6

// average
const avg = Enumerable.from([2, 4, 6, 8]).average();
console.log(avg); // 5

// max
const max = Enumerable.from([5, 2, 9, 1]).max();
console.log(max); // 9

// count
const count = Enumerable.from([1, 2, 45, 6, 8]).count();
console.log(count); // 5
