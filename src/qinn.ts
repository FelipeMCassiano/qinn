type PrimitiveOrSelf<T> = T extends number | string ? T : T[keyof T];
/**
 * A LINQ-inspired enumerable class that provides powerful query operations
 * over both synchronous and asynchronous iterables.
 *
 * @template T - The type of elements in the enumerable
 *
 * @example
 * // Create from array
 * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
 *
 * @example
 * // Create range
 * const range = Enumerable.range(1, 5); // [1, 2, 3, 4, 5]
 *
 * @example
 * // Chain operations
 * const result = numbers
 *   .where(n => n % 2 === 0)
 *   .select(n => n * 2)
 *   .toArray(); // [4, 8]
 */
export class Enumerable<T> implements Iterable<T>, AsyncIterable<T> {
    private iterable: Iterable<T> | AsyncIterable<T>;

    /**
     * Creates a new Enumerable instance from an iterable or async iterable.
     *
     * @param iterable - The source iterable (array, Set, generator, etc.) or async iterable
     *
     * @example
     * // From array
     * const fromArray = new Enumerable([1, 2, 3]);
     *
     * @example
     * // From generator
     * function* gen() { yield 1; yield 2; }
     * const fromGenerator = new Enumerable(gen());
     *
     * @example
     * // From async iterable
     * async function* asyncGen() { yield 1; yield 2; }
     * const fromAsync = new Enumerable(asyncGen());
     */
    constructor(iterable: Iterable<T> | AsyncIterable<T>) {
        this.iterable = iterable;
    }
    [Symbol.iterator]() {
        if ((this.iterable as Iterable<T>)[Symbol.iterator]) {
            return (this.iterable as Iterable<T>)[Symbol.iterator]();
        }
        throw new Error(
            "This enumerable is async — use for await or toArrayAsync()"
        );
    }

    async *[Symbol.asyncIterator]() {
        if ((this.iterable as AsyncIterable<T>)[Symbol.asyncIterator]) {
            for await (const item of this.iterable as AsyncIterable<T>) {
                yield item;
            }
        } else {
            for (const item of this.iterable as Iterable<T>) {
                yield item;
            }
        }
    }

    /**
     * Creates an empty enumerable.
     *
     * @template T - The element type
     * @returns An empty enumerable
     *
     * @example
     * const empty = Enumerable.empty<number>();
     * console.log(empty.toArray()); // []
     */
    static empty<T>(): Enumerable<T> {
        function* generator() {}

        return new Enumerable(generator() as Iterable<T>);
    }

    /**
     * Creates an enumerable from an existing iterable.
     *
     * @template T - The element type
     * @param iterable - Source iterable (array, Set, Map, etc.)
     * @returns A new enumerable wrapping the iterable
     *
     * @example
     * const fromArray = Enumerable.from([1, 2, 3]);
     * const fromSet = Enumerable.from(new Set([1, 2, 3]));
     */
    static from<T>(iterable: Iterable<T>): Enumerable<T> {
        return new Enumerable(iterable);
    }

    /**
     * Generates a sequence of numbers within a specified range.
     *
     * @param start - The value of the first number in the sequence
     * @param count - The number of sequential numbers to generate
     * @returns An enumerable containing a range of sequential numbers
     *
     * @example
     * const numbers = Enumerable.range(1, 5); // [1, 2, 3, 4, 5]
     * const fromTen = Enumerable.range(10, 3); // [10, 11, 12]
     */
    static range(start: number, count: number): Enumerable<number> {
        const arr = new Array(count);
        for (let i = 0; i < count; i++) {
            arr[i] = start + i;
        }
        return new Enumerable(arr);
    }

    /**
     * Caches the results of a transformation function to avoid recomputation.
     *
     * @template S - The type of the value returned by the transformation
     * @template U - The type of the cache key
     * @param fn - Transformation function whose results should be cached
     * @param keySelector - Function to generate cache keys (defaults to JSON.stringify)
     * @returns An enumerable with memoized transformation results
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 1, 2]);
     * const expensiveOperation = (n: number) => {
     *   console.log('Computing...', n);
     *   return n * n;
     * };
     *
     * // Will only compute for unique numbers
     * const memoized = numbers.memoize(expensiveOperation);
     * memoized.toArray(); // Only computes for 1, 2, 3
     */
    memoize<S, U extends string | number | symbol>(
        fn: (obj: T) => S,
        keySelector?: (obj: T) => U
    ): Enumerable<S> {
        const cache: Map<string | U, S> = new Map();
        const self = this;
        const memoizedIterable = {
            [Symbol.iterator]() {
                return (function* () {
                    for (const item of self) {
                        const key = keySelector
                            ? keySelector(item)
                            : JSON.stringify(item);
                        if (cache.has(key)) {
                            yield cache.get(key)!;
                        } else {
                            const result = fn(item);
                            cache.set(key, result);
                            yield result;
                        }
                    }
                })();
            },
        };
        return new Enumerable(memoizedIterable);
    }

    /**
     * Caches the results of an asynchronous transformation function to avoid recomputation.
     * Useful for expensive async operations like API calls or file reads.
     *
     * @template S - The type of the value returned by the transformation
     * @template U - The type of the cache key
     * @param fn - Async transformation function whose results should be cached
     * @param keySelector - Function to generate cache keys (defaults to JSON.stringify)
     * @returns An enumerable with memoized async transformation results
     *
     * @example
     * // Simulate expensive async operation
     * const fetchUserData = async (id: number) => {
     *   console.log('Fetching user', id);
     *   return await api.getUser(id);
     * };
     *
     * const userIds = Enumerable.from([1, 2, 1, 3, 2]);
     * const memoizedUsers = userIds.memoizeAsync(fetchUserData);
     *
     * // Will only fetch data for unique user IDs
     * for await (const user of memoizedUsers) {
     *   console.log(user);
     * }
     *
     * @example
     * // With custom key selector
     * const users = Enumerable.from([
     *   { id: 1, name: 'John' },
     *   { id: 2, name: 'Jane' }
     * ]);
     *
     * const memoized = users.memoizeAsync(
     *   async user => await processUser(user),
     *   user => user.id // Use ID as cache key
     * );
     */
    memoizeAsync<S, U extends string | number | symbol>(
        fn: (obj: T) => Promise<S> | S,
        keySelector?: (obj: T) => U
    ): Enumerable<Awaited<S>> {
        const cache: Map<string | U, Promise<S>> = new Map();
        const self = this;
        const memoizedIterable = {
            async *[Symbol.asyncIterator]() {
                for await (const item of self.iterable as AsyncIterable<T>) {
                    const key = keySelector
                        ? keySelector(item)
                        : JSON.stringify(item);
                    if (cache.has(key)) {
                        yield cache.get(key)!;
                    } else {
                        const promise = Promise.resolve(fn(item));
                        cache.set(key, promise);
                        yield promise;
                    }
                }
            },
        };
        return new Enumerable(memoizedIterable);
    }

    /**
     * Projects each element into a new form.
     *
     * @template S - The type of the value returned by selector
     * @param mapper - A transform function to apply to each element
     * @returns An enumerable whose elements are the result of invoking the transform function
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3]);
     * const squares = numbers.select(n => n * n); // [1, 4, 9]
     *
     * @example
     * const users = Enumerable.from([{ name: 'John' }, { name: 'Jane' }]);
     * const names = users.select(user => user.name); // ['John', 'Jane']
     */
    select<S extends PrimitiveOrSelf<T> | unknown>(
        mapper: (obj: T) => S
    ): Enumerable<S> {
        const self = this;
        function* generator() {
            for (const item of self) {
                yield mapper(item);
            }
        }

        return new Enumerable(generator());
    }

    /**
     * Filters a sequence of values based on a predicate.
     *
     * @param predicate - A function to test each element for a condition
     * @returns An enumerable that contains elements from the input sequence that satisfy the condition
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * const evens = numbers.where(n => n % 2 === 0); // [2, 4]
     */
    where(predicate: (obj: T) => boolean): Enumerable<T> {
        const self = this;
        function* generator() {
            for (const item of self) {
                if (predicate(item)) yield item;
            }
        }

        return new Enumerable(generator());
    }

    /**
     * Returns the first element in a sequence that satisfies a condition.
     *
     * @param predicate - A function to test each element for a condition (optional)
     * @returns The first element that passes the test, or undefined if no element passes
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * console.log(numbers.first()); // 1
     * console.log(numbers.first(n => n > 3)); // 4
     * console.log(numbers.first(n => n > 10)); // undefined
     */
    first(predicate?: (obj: T) => boolean): T | undefined {
        for (const item of this) {
            if (predicate && predicate(item)) {
                return item;
            }
            if (!predicate) {
                return item;
            }
        }
        return;
    }

    /**
     * Returns the number of elements in a sequence.
     *
     * @param predicate - A function to test each element for a condition (optional)
     * @returns The number of elements in the sequence (that satisfy the condition if provided)
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * console.log(numbers.count()); // 5
     * console.log(numbers.count(n => n % 2 === 0)); // 2
     */
    count(predicate?: (obj: T) => boolean): number {
        let i = 0;
        for (const item of this) {
            if (predicate && !predicate(item)) {
                continue;
            }
            i++;
        }
        return i;
    }

    /**
     * Computes the sum of a sequence of numeric values.
     *
     * @param selector - A transform function to extract numeric values (optional)
     * @returns The sum of the values in the sequence
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * console.log(numbers.sum()); // 15
     *
     * const objects = Enumerable.from([{ value: 1 }, { value: 2 }]);
     * console.log(objects.sum(obj => obj.value)); // 3
     */
    sum(selector?: (obj: T) => number): number {
        let i = 0;
        for (const item of this) {
            if (selector) {
                i += selector(item);
                continue;
            }
            i += Number(item);
        }
        return i;
    }

    /**
     * Computes the average of a sequence of numeric values.
     *
     * @param selector - A transform function to extract numeric values (optional)
     * @returns The average of the values in the sequence, or 0 for empty sequences
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * console.log(numbers.average()); // 3
     *
     * const objects = Enumerable.from([{ value: 10 }, { value: 20 }]);
     * console.log(objects.average(obj => obj.value)); // 15
     */
    average(selector?: (obj: T) => number): number {
        let sum = 0;
        let count = 0;
        for (const item of this) {
            if (selector) {
                sum += selector(item);
            } else {
                sum += Number(item);
            }
            count++;
        }
        return count === 0 ? 0 : sum / count;
    }
    /**
     * Returns the maximum value in a sequence.
     *
     * @returns The maximum value in the sequence, or undefined if the sequence is empty
     *
     * @example
     * const numbers = Enumerable.from([1, 5, 3, 9, 2]);
     * console.log(numbers.max()); // 9
     *
     * @example
     * const empty = Enumerable.empty<number>();
     * console.log(empty.max()); // undefined
     *
     * @example
     * const letters = Enumerable.from(['a', 'c', 'b']);
     * console.log(letters.max()); // 'c'
     */
    max(): T | undefined {
        let hasValue = false;
        let max!: T;
        for (const item of this) {
            if (!hasValue) {
                max = item;
                hasValue = true;
                continue;
            }
            if (item > max) {
                max = item;
            }
        }
        return max;
    }

    /**
     * Returns the minimum value in a sequence.
     *
     * @returns The minimum value in the sequence, or undefined if the sequence is empty
     *
     * @example
     * const numbers = Enumerable.from([5, 1, 9, 3, 2]);
     * console.log(numbers.min()); // 1
     *
     * @example
     * const empty = Enumerable.empty<number>();
     * console.log(empty.min()); // undefined
     *
     * @example
     * const letters = Enumerable.from(['c', 'a', 'b']);
     * console.log(letters.min()); // 'a'
     */
    min(): T | undefined {
        let hasValue = false;
        let max!: T;
        for (const item of this) {
            if (!hasValue) {
                max = item;
                hasValue = true;
                continue;
            }
            if (item < max) {
                max = item;
            }
        }
        return max;
    }

    /**
     * Returns a specified number of contiguous elements from the start.
     *
     * @param n - The number of elements to take
     * @returns An enumerable that contains the specified number of elements
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * const firstThree = numbers.take(3); // [1, 2, 3]
     */
    take(n: number): Enumerable<T> {
        const self = this;
        function* generator() {
            let i = 1;
            for (const item of self) {
                if (i <= n) {
                    i++;
                    yield item;
                }
            }
        }

        return new Enumerable(generator());
    }

    /**
     * Returns distinct elements from a sequence.
     * Uses an internal Set to ensure uniqueness.
     *
     * @returns A new enumerable containing unique elements from the source sequence
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 2, 3, 3, 3]);
     * const distinct = numbers.distinct(); // [1, 2, 3]
     *
     * @remarks
     * Comparison is based on strict equality (`===`).
     * For object-based uniqueness, use `.distinctBy(keySelector)`.
     */
    distinct(): Enumerable<T> {
        const self = this;
        function* generator() {
            const seen = new Set<T>();
            for (const item of self) {
                if (!seen.has(item)) {
                    seen.add(item);
                    yield item;
                }
            }
        }
        return new Enumerable(generator());
    }
    /**
     * Returns distinct elements based on a key selector.
     *
     * @param keySelector - Function that returns a key used for comparison
     * @returns A new enumerable containing unique elements by key
     *
     * @example
     * const users = Enumerable.from([
     *   { id: 1, name: "Alice" },
     *   { id: 2, name: "Bob" },
     *   { id: 1, name: "Alice" }
     * ]);
     *
     * const distinctUsers = users.distinctBy(u => u.id);
     * // [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
     */
    distinctBy<S>(keySelector: (obj: T) => S): Enumerable<T> {
        const self = this;
        function* generator() {
            const seen = new Set<S>();
            for (const item of self) {
                const key = keySelector(item);
                if (!seen.has(key)) {
                    seen.add(key);
                    yield item;
                }
            }
        }
        return new Enumerable(generator());
    }

    /**
     * Sorts the elements in ascending order according to a key.
     *
     * @template S - The type of the key returned by the selector
     * @param selector - A function to extract a key from an element
     * @returns An enumerable whose elements are sorted in ascending order
     *
     * @example
     * const numbers = Enumerable.from([3, 1, 4, 1, 5]);
     * const sorted = numbers.orderBy(n => n); // [1, 1, 3, 4, 5]
     *
     * const users = Enumerable.from([
     *   { name: 'John', age: 30 },
     *   { name: 'Jane', age: 25 }
     * ]);
     * const byAge = users.orderBy(user => user.age); // Jane first, then John
     */
    orderBy<S extends PrimitiveOrSelf<T>>(
        selector: (obj: T) => S
    ): Enumerable<T> {
        const self = this;
        function* generator() {
            const arr = Array.from(self.iterable as Iterable<T>);

            if (arr.length <= 1) {
                yield* arr;
                return;
            }
            const pivot = selector(arr[arr.length - 1] as T);
            const left = arr.filter((x) => selector(x) < pivot);
            const equal = arr.filter((x) => selector(x) === pivot);
            const right = arr.filter((x) => selector(x) > pivot);

            yield* new Enumerable(left).orderBy(selector);
            yield* equal;
            yield* new Enumerable(right).orderBy(selector);
        }
        return new Enumerable(generator());
    }

    /**
     * Sorts the elements in descending order according to a key.
     *
     * @template S - The type of the key returned by the selector
     * @param selector - A function to extract a key from an element
     * @returns An enumerable whose elements are sorted in descending order
     *
     * @example
     * const numbers = Enumerable.from([3, 1, 4, 1, 5]);
     * const sorted = numbers.orderByDescending(n => n); // [5, 4, 3, 1, 1]
     */
    orderByDescending<S extends PrimitiveOrSelf<T>>(
        selector: (obj: T) => S
    ): Enumerable<T> {
        const self = this;
        function* generator() {
            const arr = Array.from(self);

            if (arr.length <= 1) {
                yield* arr;
                return;
            }
            const pivot = selector(arr[arr.length - 1] as T);
            const left = arr.filter((x) => selector(x) > pivot);
            const equal = arr.filter((x) => selector(x) === pivot);
            const right = arr.filter((x) => selector(x) < pivot);

            yield* new Enumerable(left).orderByDescending(selector);
            yield* equal;
            yield* new Enumerable(right).orderByDescending(selector);
        }
        return new Enumerable(generator());
    }
    /**
     * Reverses the order of elements in a sequence.
     *
     * @returns An enumerable whose elements correspond to the source sequence in reverse order
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * const reversed = numbers.reverse(); // [5, 4, 3, 2, 1]
     *
     * @example
     * const letters = Enumerable.from(['a', 'b', 'c']);
     * console.log(letters.reverse().toArray()); // ['c', 'b', 'a']
     */
    reverse(): Enumerable<T> {
        const self = this;
        function* generator() {
            const arr = self.toArray();
            yield* arr.reverse();
        }
        return new Enumerable(generator());
    }

    /**
     * Concatenates two sequences.
     *
     * @param iterable - The sequence to concatenate to this sequence
     * @returns An enumerable that contains the concatenated elements of the two sequences
     *
     * @example
     * const first = Enumerable.from([1, 2, 3]);
     * const second = [4, 5, 6];
     * const combined = first.concat(second); // [1, 2, 3, 4, 5, 6]
     *
     * @example
     * const letters = Enumerable.from(['a', 'b']);
     * const moreLetters = ['c', 'd'];
     * const allLetters = letters.concat(moreLetters); // ['a', 'b', 'c', 'd']
     */
    concat(iterable: Iterable<T>): Enumerable<T> {
        const self = this;

        function* generator() {
            for (const item of self) {
                yield item;
            }

            for (const item of iterable) {
                yield item;
            }
        }
        return new Enumerable(generator());
    }

    /**
     * Determines whether all elements satisfy a condition.
     *
     * @param predicate - A function to test each element
     * @returns true if every element passes the test, false otherwise
     *
     * @example
     * const numbers = Enumerable.from([2, 4, 6, 8]);
     * console.log(numbers.all(n => n % 2 === 0)); // true
     * console.log(numbers.all(n => n > 5)); // false
     */
    all(predicate: (obj: T) => boolean): boolean {
        for (const item of this) {
            if (!predicate(item)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Determines whether any element exists or satisfies a condition.
     *
     * @param predicate - A function to test each element (optional)
     * @returns true if the sequence contains any elements (that satisfy the condition)
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3, 4, 5]);
     * console.log(numbers.any()); // true
     * console.log(numbers.any(n => n > 3)); // true
     * console.log(numbers.any(n => n > 10)); // false
     */
    any(predicate?: (obj: T) => boolean): boolean {
        let isMatch = false;
        for (const item of this) {
            if (!predicate) {
                isMatch = true;
            }
            if (predicate && predicate(item)) {
                isMatch = true;
            }
            if (isMatch) {
                return isMatch;
            }
        }
        return isMatch;
    }
    append(value: T): Enumerable<T> {
        const self = this;
        function* generator() {
            for (const item of self) {
                yield item;
            }

            yield value;
        }
        return new Enumerable(generator());
    }
    prepend(value: T): Enumerable<T> {
        const self = this;
        function* generator() {
            yield value;
            for (const item of self) {
                yield item;
            }
        }
        return new Enumerable(generator());
    }
    contains(value: T): boolean {
        for (const item of this) {
            if (item === value) {
                return true;
            }
        }
        return false;
    }

    /**
     * Converts the enumerable to an array asynchronously.
     *
     * @returns A promise that resolves to an array containing all elements
     *
     * @example
     * async function example() {
     *   const asyncNumbers = getAsyncEnumerable();
     *   const array = await asyncNumbers.toArrayAsync();
     * }
     */
    async toArrayAsync(): Promise<T[]> {
        return await Array.fromAsync(this.iterable);
    }

    /**
     * Converts the enumerable to an array.
     *
     * @returns An array containing all elements from the enumerable
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 3]);
     * const array = numbers.toArray(); // [1, 2, 3]
     */
    toArray(): T[] {
        return [...this];
    }
    /**
     * Creates a Map from an enumerable, using the last occurrence for duplicate keys.
     * Optionally logs warnings when duplicates are overwritten.
     *
     * @param keySelector - Function to extract keys
     * @param valueSelector - Function to extract values
     * @param warnOnDuplicates - Whether to log warnings when duplicates are found (default: false)
     * @returns Map with last occurrence values for duplicate keys
     */ toMap<S, U extends T[keyof T]>(
        keySelector: (obj: T) => S,
        valueSelector: (obj: T) => U,
        warnOnDuplicates: boolean = false
    ): Map<S, U> {
        const map = new Map<S, U>();
        for (const item of this) {
            const key = keySelector(item);

            if (warnOnDuplicates && map.has(key)) {
                console.warn(
                    `Duplicate key '${key} found. Using las occurrence.`
                );
            }
            map.set(key, valueSelector(item));
        }
        return map;
    }
    /**
     * Creates a Set from an enumerable, removing duplicate elements.
     *
     * @returns A Set containing the distinct elements from the input sequence
     *
     * @example
     * const numbers = Enumerable.from([1, 2, 2, 3, 3, 3]);
     * const numberSet = numbers.toSet(); // Set(3) { 1, 2, 3 }
     *
     * @example
     * const objects = Enumerable.from([
     *   { id: 1 }, { id: 2 }, { id: 1 }
     * ]);
     * const objectSet = objects.toSet();
     * // Set(2) { {id: 1}, {id: 2} } - Objects are compared by reference
     *
     * @remarks
     * For value-based comparison of objects, consider using `.distinct()` with a custom comparator
     * or converting to JSON strings first.
     */
    toSet(): Set<T> {
        return new Set(this);
    }

    /**
     * Produces the set union of this sequence and another sequence.
     * Returns all distinct elements that appear in either sequence, preserving
     * the order in which they first appear.
     *
     * @template S - The type of the comparison key returned by the key selector
     * @param enumerable - The sequence to union with the current sequence
     * @param keySelector - Optional function to project each element to a comparison key.
     *                      When provided, uniqueness is determined by this key; otherwise,
     *                      strict equality (`===`) on the element itself is used.
     * @returns A new enumerable that contains the distinct elements from both sequences
     *
     * @example
     * const first = Enumerable.from([1, 2, 3]);
     * const second = Enumerable.from([3, 4, 5]);
     * const union = first.union(second);
     * // [1, 2, 3, 4, 5]
     * @remarks
     * This operator is set-like: it removes duplicates across both sequences.
     *
     * If you want simple concatenation without deduplication, use {@link concat}.
     */
    union<S = T>(
        enumerable: Enumerable<T>,
        keySelector?: (obj: T) => S
    ): Enumerable<T | S> {
        const self = this;

        function* generator() {
            const seen = new Set<T | S>();
            for (const item of self) {
                const key = keySelector ? keySelector(item) : item;
                if (!seen.has(key)) {
                    seen.add(key);
                    yield item;
                }
            }
            for (const item of enumerable) {
                const key = keySelector ? keySelector(item) : item;

                if (!seen.has(key)) {
                    seen.add(key);
                    yield item;
                }
            }
        }

        return new Enumerable(generator());
    }

    /**
     * Produces the set intersection of this sequence and another sequence.
     * Returns the distinct elements that appear in both sequences, preserving
     * the order in which they first appear in the current sequence.
     *
     * @template S - The type of the comparison key returned by the key selector
     * @param enumerable - The sequence to intersect with the current sequence
     * @param keySelector - Optional function to project each element to a comparison key.
     *                      When provided, equality is determined by this key; otherwise,
     *                      strict equality (`===`) on the element itself is used.
     * @returns A new enumerable that contains the common elements of both sequences
     *
     * @example
     * const first = Enumerable.from([1, 2, 3, 4]);
     * const second = Enumerable.from([3, 4, 5, 6]);
     * const common = first.intersect(second);
     * // [3, 4]
     *
     * @remarks
     * This operator is set-like: it returns distinct common elements based on
     * the chosen equality rule (element or key). If you need all matches,
     * including duplicates from the first sequence, consider a custom `where`
     * with `contains` instead.
     */
    intersect<S = T>(
        enumerable: Enumerable<T>,
        keySelector?: (obj: T) => S
    ): Enumerable<T> {
        const self = this;
        function* generator() {
            const set: Set<S | T> = enumerable.toSet();

            for (const item of self) {
                const key = keySelector ? keySelector(item) : item;
                if (set.has(key)) {
                    yield item;
                }
            }
        }

        return new Enumerable(generator());
    }
}
