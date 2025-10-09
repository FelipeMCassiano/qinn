class Enumerable<T> implements Iterable<T> {
    private iterable: Iterable<T>;

    constructor(iterable: Iterable<T>) {
        this.iterable = iterable;
    }
    [Symbol.iterator]() {
        return this.iterable[Symbol.iterator]();
    }

    select<S extends T[keyof T]>(mapper: (obj: T) => S): Enumerable<S> {
        const self = this;
        function* generator() {
            for (const item of self.iterable) {
                yield mapper(item);
            }
        }

        return new Enumerable(generator());
    }

    where(predicate: (obj: T) => boolean): Enumerable<T> {
        const self = this;
        function* generator() {
            for (const item of self.iterable) {
                if (predicate(item)) yield item;
            }
        }

        return new Enumerable(generator());
    }

    first(): T | undefined {
        for (const item of this.iterable) {
            return item;
        }
    }
    count(): number {
        let i = 0;
        for (const _ of this.iterable) {
            i++;
        }
        return i;
    }
    sum(selector: (obj: T) => number): number {
        let i = 0;
        for (const item of this.iterable) {
            i += selector(item);
        }
        return i;
    }
    take(n: number): Enumerable<T> {
        const self = this;
        function* generator() {
            let i = 1;
            for (const item of self.iterable) {
                if (i <= n) {
                    i++;
                    yield item;
                }
            }
        }

        return new Enumerable(generator());
    }
    distinct(): Enumerable<T> {
        const self = this;
        function* generator() {
            for (const item of self.iterable) {
                yield item;
            }
        }
        return new Enumerable(new Set(generator()));
    }
    orderBy<S extends T[keyof T] | T>(selector: (obj: T) => S): Enumerable<T> {
        const self = this;
        function* generator() {
            const arr = Array.from(self.iterable);

            if (arr.length <= 1) {
                yield* arr;
                return;
            }
            const pivot = selector(arr[arr.length - 1] as T);
            const left = arr.filter((x) => selector(x) < pivot);
            const equal = arr.filter((x) => selector(x) === pivot);
            const right = arr.filter((x) => selector(x) > pivot);

            yield* new Enumerable(left).orderBy(selector).iterable;
            yield* equal;
            yield* new Enumerable(right).orderBy(selector).iterable;
        }
        return new Enumerable(generator());
    }
    orderByDescending<S extends T[keyof T] | T>(
        selector: (obj: T) => S
    ): Enumerable<T> {
        const self = this;
        function* generator() {
            const arr = Array.from(self.iterable);

            if (arr.length <= 1) {
                yield* arr;
                return;
            }
            const pivot = selector(arr[arr.length - 1] as T);
            const left = arr.filter((x) => selector(x) > pivot);
            const equal = arr.filter((x) => selector(x) === pivot);
            const right = arr.filter((x) => selector(x) < pivot);

            yield* new Enumerable(left).orderByDescending(selector).iterable;
            yield* equal;
            yield* new Enumerable(right).orderByDescending(selector).iterable;
        }
        return new Enumerable(generator());
    }
    reverse(): Enumerable<T> {
        const self = this;
        function* generator() {
            const arr = self.toArray();
            let left = 0;
            let right = arr.length - 1;
            while (left < right) {
                const temp = arr[left] as T;
                arr[left] = arr[right] as T;
                arr[right] = temp;
                left++;
                right--;
            }
            yield* arr;
        }
        return new Enumerable(generator());
    }

    async toArrayAsync(): Promise<T[]> {
        return await Array.fromAsync(this.iterable);
    }
    toArray(): T[] {
        return Array.from(this.iterable);
    }
}

type Person = {
    name: string;
    age: number;
};

(function main() {
    const ps: Person[] = [
        { name: "felipe", age: 18 },
        { name: "cassiano", age: 17 },
        { name: "morais", age: 16 },
        { name: "felipe", age: 18 },
    ];

    const e = new Enumerable(ps);

    // console.log(e.toArray());
    // console.log(r.toArray());
    // console.log(e.first());
    // console.log(e.count());
    // console.log(e.take(2).toArray());
    // console.log(e.select((a) => new Date()).toArray());

    const e2 = new Enumerable([1, 6, 2, 4]);
    const start = Date.now();

    // console.log(e2.distinct().toArray());
    console.log(e2.orderBy((i) => i).toArray());
    console.log(e2.orderByDescending((i) => i).toArray());
    console.log(e.orderByDescending((p) => p.age).toArray());
    console.log();
    console.log(e2.reverse().toArray());
})();
