import { Enumerable } from "../src/qinn";

// memoize
const double = (n: number) => {
    console.log("Calculating", n);
    return n * 2;
};

const numbers = Enumerable.from([1, 2, 3]).memoize(double);
console.log(numbers.toArray()); // triggers calculations
console.log(numbers.toArray()); // uses cached values

// memozeAsync
const fetchSim = async (id: number) => {
    console.log("Fetching", id);
    return { id, data: `data-${id}` };
};

(async () => {
    const memoized = Enumerable.from([1, 2, 3]).memoizeAsync(fetchSim);
    console.log(await memoized.toArrayAsync()); // first time
    console.log(await memoized.toArrayAsync()); // cached
})();
