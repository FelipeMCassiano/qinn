import { Enumerable } from "../src/qinn";

describe("Enumerable creation", () => {
    test("Should be able to create an enumerable from an iterable", () => {
        const from = Enumerable.from([1]).toArray();
        expect(from).toEqual([1]);
    });
    test("Should be able to create an empty enumerable of a given type", () => {
        const empty = Enumerable.empty<number>().toArray();
        expect(empty).toEqual([]);
    });
    test("Should be able to create an enumerable over a range", () => {
        const range = Enumerable.range(1, 5).toArray();
        expect(range).toEqual([1, 2, 3, 4, 5]);
    });
});

describe("Filtering and Selection", () => {
    const persons = [
        { name: "Felipe", age: 21 },
        { name: "Lucas", age: 25 },
        { name: "Ana", age: 19 },
    ];
    test("where() should filter elements", () => {
        const adults = Enumerable.from(persons)
            .where((p) => p.age >= 21)
            .toArray();

        expect(adults).toEqual([
            { name: "Felipe", age: 21 },
            { name: "Lucas", age: 25 },
        ]);
    });

    test("select() should map elements", () => {
        const names = Enumerable.from(persons)
            .select((p) => p.name)
            .toArray();

        expect(names).toEqual(["Felipe", "Lucas", "Ana"]);
    });
    test("distinct() should remove duplicates", () => {
        const result = Enumerable.from([1, 2, 2, 3, 3, 3]).distinct().toArray();

        expect(result).toEqual([1, 2, 3]);
    });

    test("distintBy() should remove duplicates by a key", () => {
        const persons = [
            { name: "Felipe", age: 21 },
            { name: "Lucas", age: 21 },
            { name: "Ana", age: 19 },
        ];

        const enumerable = Enumerable.from(persons);

        expect(enumerable.distinctBy((p) => p.age).toArray()).toEqual([
            { name: "Felipe", age: 21 },
            { name: "Ana", age: 19 },
        ]);
    });
    test("take() should take the given number of elements", () => {
        const persons = [
            { name: "Felipe", age: 21 },
            { name: "Lucas", age: 25 },
            { name: "Ana", age: 19 },
        ];
        const twoElm = Enumerable.from(persons).take(2).toArray();
        expect(twoElm).toEqual(persons.slice(0, 2));
    });
});

describe("Aggregation (count, sum, max, min)", () => {
    const nums = Enumerable.from([1, 2, 3, 4, 5]);
    test("count() should return number of elements", () => {
        expect(nums.count()).toBe(5);
    });
    test("count() should return number of elements that matches the condition", () => {
        expect(nums.count((n) => n % 2 === 0)).toBe(2);
    });

    test("sum() should sum numeric elements", () => {
        expect(nums.sum((n) => n)).toBe(15);
    });
    test("sum() should sum numeric elements without selector", () => {
        expect(nums.sum()).toBe(15);
    });

    test("max() should return the maximum value", () => {
        expect(nums.max()).toBe(5);
        expect(Enumerable.from([5, 1, 2, 4, 6, 7]).max()).toBe(7);
    });

    test("min() should return the minimum value", () => {
        expect(nums.min()).toBe(1);
        expect(Enumerable.from([2, 4, 5, 1]).min()).toBe(1);
    });
    test("average() should return the avarege of numeric elements", () => {
        expect(nums.average((n) => n)).toBe(3);
    });
    test("average() should return the avarege of numeric elements without selector", () => {
        expect(nums.average()).toBe(3);
    });
});

describe("Chaining", () => {
    test("concat() should merge two enumerables", () => {
        const result = Enumerable.from([1, 2])
            .concat(Enumerable.from([3, 4]))
            .toArray();

        expect(result).toEqual([1, 2, 3, 4]);
    });

    test("Should adds an element to the beginning", () => {
        const addedAtBeginning = Enumerable.from([1, 2, 3])
            .prepend(4)
            .toArray();
        expect(addedAtBeginning).toEqual([4, 1, 2, 3]);
    });
    test("Should adds an element to the end", () => {
        const addedAtEnd = Enumerable.from([1, 2, 3]).append(4).toArray();
        expect(addedAtEnd).toEqual([1, 2, 3, 4]);
    });
});

describe("Ordering", () => {
    test("orderBy() should sort ascending", () => {
        const result = Enumerable.from([3, 1, 4, 2])
            .orderBy((x) => x)
            .toArray();

        expect(result).toEqual([1, 2, 3, 4]);
    });

    test("orderByDescending() should sort descending", () => {
        const result = Enumerable.from([3, 1, 4, 2])
            .orderByDescending((x) => x)
            .toArray();

        expect(result).toEqual([4, 3, 2, 1]);
    });
    test("reverse() should reverse itens", () => {
        const reversed = Enumerable.from([1, 2, 3, 4]).reverse().toArray();

        expect(reversed).toEqual([4, 3, 2, 1]);
    });
});

describe("Conversion", () => {
    test("toArray() should convert to array", () => {
        const enumerable = Enumerable.from([1, 2, 3]);
        expect(enumerable.toArray()).toEqual([1, 2, 3]);
    });

    test("toArrayAsync() should convert to array asynchronously", async () => {
        const enumerable = Enumerable.from(["a", "b", "c"]);
        const toArrayAsync = await enumerable.toArrayAsync();
        expect(toArrayAsync).toEqual(["a", "b", "c"]);
    });

    test("toSet() should to set", () => {
        const toSet = Enumerable.from([1, 2, 4, 1]).toSet();

        expect(toSet).toEqual(new Set([1, 2, 4]));
    });
    test("toMap() should to map", () => {
        const persons = [
            { name: "Felipe", age: 21 },
            { name: "Lucas", age: 25 },
            { name: "Ana", age: 19 },
        ];

        const personEnumerable = Enumerable.from(persons);
        const toMap = personEnumerable.toMap(
            (p) => p.name,
            (p) => p.age
        );
        const personsMap = new Map(
            personEnumerable.toArray().map((p) => [p.name, p.age])
        );
        expect(toMap).toEqual(personsMap);
    });
});

describe("Element Checks", () => {
    test("all() should return true if all elements matches the condition", () => {
        const allMatches = Enumerable.from([2, 4, 6]).all((n) => n % 2 === 0);
        expect(allMatches).toBeTruthy();
    });
    test("all() should return false if one element doesn't match the condition", () => {
        const oneDoesntMatch = Enumerable.from([2, 4, 5]).all(
            (n) => n % 2 === 0
        );
        expect(oneDoesntMatch).toBeFalsy();
    });
    test("all() should return true for all() on empty enumerable (vacuous truth)", () => {
        expect(Enumerable.empty<number>().all((x) => x > 0)).toBeTruthy();
    });
    test("any() should return true if one element match the condition", () => {
        const oneMatch = Enumerable.from([2, 3, 5]).any((n) => n % 2 === 0);
        expect(oneMatch).toBeTruthy();
    });

    test("any() should return false on empty enumerable", () => {
        expect(Enumerable.empty<number>().any((x) => x > 0)).toBeFalsy();
    });

    test("any() should return true if at least one element exists", () => {
        expect(Enumerable.from([1]).any()).toBeTruthy();
    });
    test("contains() should check for element presence", () => {
        const enumerable = Enumerable.from(["a", "b", "c"]);
        expect(enumerable.contains("b")).toBe(true);
        expect(enumerable.contains("z")).toBe(false);
    });
    test("contains() should return false in abscense of the element", () => {
        const doesNotContains = Enumerable.from([1, 2, 3]).contains(4);
        expect(doesNotContains).toBeFalsy();
    });
    test("first() should return the first element", () => {
        const enumerable = Enumerable.from([1, 2, 3]);
        expect(enumerable.first()).toBe(1);
    });
    test("first() should return the first element that matches the condition", () => {
        const enumerable = Enumerable.from([1, 2, 4]);
        expect(enumerable.first((n) => n % 2 === 0)).toBe(2);
    });
    test("first() should return undefined if no element matches the condition", () => {
        const enumerable = Enumerable.from([1, 3, 5]);
        expect(enumerable.first((n) => n % 2 === 0)).toBe(undefined);
    });
});

describe("Memoization", () => {
    it("should cache results of the memoized function", () => {
        const numbers = Enumerable.from([1, 2, 3, 1, 2, 3]);
        const square = jest.fn((n: number) => n * n);

        const memoizedEnumerable = numbers.memoize(square);
        const results = memoizedEnumerable.toArray();

        expect(square).toHaveBeenCalledTimes(3);
        expect(results).toEqual([1, 4, 9, 1, 4, 9]);
    });
    it("should return cached results on subsequent calls", () => {
        const numbers = Enumerable.from([1, 2, 3]);
        const double = jest.fn((n: number) => n * 2);

        const memoizedEnumerable = numbers.memoize(double);
        const firstResults = memoizedEnumerable.toArray();

        expect(firstResults).toEqual([2, 4, 6]);

        const secondResults = memoizedEnumerable.toArray();

        expect(secondResults).toEqual([2, 4, 6]);
        expect(double).toHaveBeenCalledTimes(3);
    });
    it("should handle empty enumerables", () => {
        const emptyEnumerable = Enumerable.empty<number>();
        const square = jest.fn((n: number) => n * n);

        const memoizedEnumerable = emptyEnumerable.memoize(square);
        const results = memoizedEnumerable.toArray();

        expect(results).toEqual([]);
        expect(square).not.toHaveBeenCalled();
    });

    it("should work with complex objects", () => {
        const objects = Enumerable.from([{ id: 1 }, { id: 2 }, { id: 1 }]);
        const getId = (obj: { id: number }) => obj.id;

        const memoizedEnumerable = objects.memoize(getId);
        const results = memoizedEnumerable.toArray();

        expect(results).toEqual([1, 2, 1]);
    });
});

describe("Memoization Async", () => {
    it("should cache async results of the memoized function", async () => {
        const numbers = Enumerable.from([1, 2, 3, 1, 2, 3]);
        const square = jest.fn((n: number) => n * n);

        const memoizedEnumerable = numbers.memoizeAsync(square);
        const results = await memoizedEnumerable.toArrayAsync();

        expect(square).toHaveBeenCalledTimes(3);
        expect(results).toEqual([1, 4, 9, 1, 4, 9]);
    });
    it("should return cached async results on subsequent calls", async () => {
        const numbers = Enumerable.from([1, 2, 3]);
        const double = jest.fn((n: number) => n * 2);

        const memoizedEnumerable = numbers.memoizeAsync(double);
        const firstResults = await memoizedEnumerable.toArrayAsync();

        expect(firstResults).toEqual([2, 4, 6]);

        const secondResults = await memoizedEnumerable.toArrayAsync();

        expect(secondResults).toEqual([2, 4, 6]);
        expect(double).toHaveBeenCalledTimes(3);
    });
});
