# Qinn.ts

A **TypeScript LINQ-inspired utility** for functional-style data querying and transformation over **iterables** and **async iterables**.

This library provides a clean, fluent API to manipulate collections, similar to .NET’s LINQ or JavaScript’s array methods — but more powerful, composable, and lazy.

---

## ✨ Features

-   💡 Works with **both sync and async iterables**
-   🔁 Lazy evaluation with **generator-based pipelines**
-   🧠 **Memoization** support (sync and async)
-   🔍 Query-like operations (`where`, `select`, `all`, `any`, etc.)
-   🔢 **Sorting**, **distinct**, **range**, **sum**, **average**, and more
-   🧱 Converts easily to `Array`, `Map`, or `Set`
-   🧰 Type-safe and generic — written fully in TypeScript

---

## 🚀 Installation

```bash
npm install qinn

## 🚀 Creation Methods

| **Method**                   | **Description**                                              | **Parameters**                              | **Returns**          | **Example**                             |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------- | -------------------- | --------------------------------------- |
| `new Enumerable(iterable)`   | Creates a new enumerable from an iterable or async iterable. | `iterable: Iterable<T> \| AsyncIterable<T>` | `Enumerable<T>`      | `new Enumerable([1,2,3])`               |
| `static from(iterable)`      | Wraps an iterable into an `Enumerable`.                      | `iterable: Iterable<T>`                     | `Enumerable<T>`      | `Enumerable.from([1,2,3])`              |
| `static range(start, count)` | Generates a numeric range.                                   | `start: number`, `count: number`            | `Enumerable<number>` | `Enumerable.range(1,5)` → `[1,2,3,4,5]` |
| `static empty()`             | Returns an empty enumerable.                                 | —                                           | `Enumerable<T>`      | `Enumerable.empty<number>()`            |

---

## 🔄 Iteration

| **Method**                 | **Description**                     | **Returns**        |
| -------------------------- | ----------------------------------- | ------------------ |
| `[Symbol.iterator]()`      | Enables `for...of` iteration.       | `Iterator<T>`      |
| `[Symbol.asyncIterator]()` | Enables `for await...of` iteration. | `AsyncIterator<T>` |

---

## 🧠 Transformation Methods

| **Method**                    | **Description**           | **Parameters**                | **Returns**     | **Example**                        |
| ----------------------------- | ------------------------- | ----------------------------- | --------------- | ---------------------------------- |
| `select(mapper)`              | Maps elements.            | `mapper: (obj:T)=>S`          | `Enumerable<S>` | `.select(x => x * 2)`              |
| `where(predicate)`            | Filters elements.         | `predicate: (obj:T)=>boolean` | `Enumerable<T>` | `.where(x => x > 2)`               |
| `orderBy(selector)`           | Sorts ascending.          | `selector: (obj:T)=>S`        | `Enumerable<T>` | `.orderBy(x => x.age)`             |
| `orderByDescending(selector)` | Sorts descending.         | `selector: (obj:T)=>S`        | `Enumerable<T>` | `.orderByDescending(x => x.price)` |
| `reverse()`                   | Reverses sequence.        | —                             | `Enumerable<T>` | `.reverse()`                       |
| `concat(iterable)`            | Appends another iterable. | `iterable: Iterable<T>`       | `Enumerable<T>` | `.concat([4,5])`                   |
| `append(value)`               | Adds value at end.        | `value: T`                    | `Enumerable<T>` | `.append(10)`                      |
| `prepend(value)`              | Adds value at start.      | `value: T`                    | `Enumerable<T>` | `.prepend(0)`                      |

---

## 🧩 Uniqueness

| **Method**                | **Description**            | **Parameters**            | **Returns**     | **Example**            |
| ------------------------- | -------------------------- | ------------------------- | --------------- | ---------------------- |
| `distinct()`              | Removes duplicates.        | —                         | `Enumerable<T>` | `.distinct()`          |
| `distinctBy(keySelector)` | Removes duplicates by key. | `keySelector: (obj:T)=>S` | `Enumerable<T>` | `.distinctBy(x=>x.id)` |

---

## ⚡ Memoization

| **Method**                       | **Description**                       | **Parameters**                                        | **Returns**              | **Example**                          |
| -------------------------------- | ------------------------------------- | ----------------------------------------------------- | ------------------------ | ------------------------------------ |
| `memoize(fn, keySelector?)`      | Caches results of a sync transform.   | `fn: (obj:T)=>S`, `keySelector?: (obj:T)=>U`          | `Enumerable<S>`          | `.memoize(x => heavyCalc(x))`        |
| `memoizeAsync(fn, keySelector?)` | Caches results of an async transform. | `fn: (obj:T)=>Promise<S>`, `keySelector?: (obj:T)=>U` | `Enumerable<Awaited<S>>` | `.memoizeAsync(async x => fetch(x))` |

---

## 📊 Aggregation Methods

| **Method**           | **Description**                  | **Parameters**                 | **Returns**      | **Example**      |
| -------------------- | -------------------------------- | ------------------------------ | ---------------- | ---------------- |
| `count(predicate?)`  | Counts all or matching elements. | `predicate?: (obj:T)=>boolean` | `number`         | `.count(x=>x>5)` |
| `sum(selector?)`     | Computes sum.                    | `selector?: (obj:T)=>number`   | `number`         | `.sum()`         |
| `average(selector?)` | Computes average.                | `selector?: (obj:T)=>number`   | `number`         | `.average()`     |
| `max()`              | Returns maximum element.         | —                              | `T \| undefined` | `.max()`         |
| `min()`              | Returns minimum element.         | —                              | `T \| undefined` | `.min()`         |

---

## 🔍 Filtering & Existence

| **Method**          | **Description**                   | **Parameters**                 | **Returns**      | **Example**       |
| ------------------- | --------------------------------- | ------------------------------ | ---------------- | ----------------- |
| `first(predicate?)` | First element matching predicate. | `predicate?: (obj:T)=>boolean` | `T \| undefined` | `.first(x=>x>10)` |
| `all(predicate)`    | True if all elements match.       | `predicate: (obj:T)=>boolean`  | `boolean`        | `.all(x=>x>0)`    |
| `any(predicate?)`   | True if any element matches.      | `predicate?: (obj:T)=>boolean` | `boolean`        | `.any(x=>x>5)`    |
| `contains(value)`   | Checks if contains value.         | `value: T`                     | `boolean`        | `.contains(3)`    |

---

## 🧰 Utility Methods

| **Method** | **Description**           | **Parameters** | **Returns**     | **Example** |
| ---------- | ------------------------- | -------------- | --------------- | ----------- |
| `take(n)`  | Takes first `n` elements. | `n: number`    | `Enumerable<T>` | `.take(3)`  |
| `skip(n)`  | Skips first `n` elements. | `n: number`    | `Enumerable<T>` | `.skip(2)`  |

---

## 🔄 Conversion

| **Method**                                             | **Description**                     | **Returns**    | **Example**                  |
| ------------------------------------------------------ | ----------------------------------- | -------------- | ---------------------------- |
| `toArray()`                                            | Converts to array.                  | `T[]`          | `.toArray()`                 |
| `toArrayAsync()`                                       | Converts async enumerable to array. | `Promise<T[]>` | `await .toArrayAsync()`      |
| `toSet()`                                              | Converts to `Set`.                  | `Set<T>`       | `.toSet()`                   |
| `toMap(keySelector, valueSelector, warnOnDuplicates?)` | Converts to `Map`.                  | `Map<K,V>`     | `.toMap(x=>x.id, x=>x.name)` |

---
```
