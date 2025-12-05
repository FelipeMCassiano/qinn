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

// intersect
const first1 = Enumerable.from([1, 2, 3, 4]);
const second1 = Enumerable.from([3, 4, 5, 6]);
const common = first1.intersect(second1);
console.log(common.toArray()); // [3, 4]

// union
const first2 = Enumerable.from([1, 2, 3]);
const second2 = Enumerable.from([3, 4, 5]);
const union = first2.union(second2);
console.log(union.toArray()); // [1, 2, 3, 4, 5]
