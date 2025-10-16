import { Enumerable } from "../src/qinn";

// select
const selectResult = Enumerable.from([1, 2, 3])
    .select((x) => x * 2)
    .toArray();
console.log(selectResult); // [2, 4, 6]

// where
const whereResult = Enumerable.from([1, 2, 3, 4])
    .where((x) => x % 2 === 0)
    .toArray();
console.log(whereResult); // [2, 4]

// orderBy
const people = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 20 },
    { name: "Carol", age: 30 },
];
const sortedAscending = Enumerable.from(people)
    .orderBy((p) => p.age)
    .toArray();
console.log(sortedAscending.map((p) => p.name)); // ["Bob", "Alice", "Carol"]

// orderByDescending
const sortedDescending = Enumerable.from(people)
    .orderByDescending((p) => p.age)
    .toArray();
console.log(sortedDescending.map((p) => p.name)); // ["Calor", "Alice", "Bob"]

// reverse
const reversed = Enumerable.from([1, 2, 3]).reverse().toArray();
console.log(reversed); // [3, 2, 1]

// concat
const enumerable1 = Enumerable.from([1, 2]);
const enumerable2 = Enumerable.from([3, 4]);
const concated = enumerable1.concat(enumerable2).toArray();
console.log(concated); // [1, 2, 3, 4]

// append
const nums = Enumerable.from([1, 2]);
const appended = nums.append(3).toArray();
console.log(appended); //  [1, 2, 3]

// prepend
const nums2 = Enumerable.from([1, 2]);
const prepended = nums2.prepend(3).toArray();
console.log(prepended); // [3, 1, 2]
