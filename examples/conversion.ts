import { Enumerable } from "../src/qinn";

// toArray
const toArray = Enumerable.from([1, 2, 3]).toArray();
console.log(toArray); // [1, 2, 3]

// toArrayAsync
(async () => {
    const toArrayAsync = await Enumerable.from([1, 2, 3]).toArrayAsync();
    console.log(toArrayAsync); // [1, 2, 3]
})();

// toSet
const toSet = Enumerable.from([1, 2, 3, 3]).toSet();
console.log(toSet); // Set(3) {1, 2, 3}

// toMap
const people = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 20 },
    { name: "Carol", age: 30 },
];

const toMap = Enumerable.from(people).toMap(
    (p) => p.name,
    (p) => p.age
);
console.log(toMap); // Map(3) { 'Alice' => 25, 'Bob' => 20, 'Carol' => 30 }
