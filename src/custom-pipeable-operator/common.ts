import { Observable } from "rxjs";
import {
  createGroupComplete,
  createValueCache,
  findLast,
  forwardObserver,
  GroupSubscription
} from "./utils";

export function myMap<T, R>(transformer: (x: T) => R) {
  return (source$: Observable<T>) =>
    new Observable<R>((observer) =>
      source$.subscribe({
        ...forwardObserver(observer),
        next: (v) => observer.next(transformer(v))
      })
    );
}

export function myMapTo<R>(x: R) {
  return (source$: Observable<any>) =>
    new Observable<R>((observer) =>
      source$.subscribe({
        ...forwardObserver(observer),
        next: (v) => observer.next(x)
      })
    );
}

export function myTap<T>(process: (x: T) => void) {
  return (source$: Observable<T>) =>
    new Observable((observer) =>
      source$.subscribe({
        ...forwardObserver(observer),
        next: (v) => {
          process(v);
          return observer.next(v);
        }
      })
    );
}

export function myFilter<T>(filterFunc: (x: T) => boolean) {
  return (source$: Observable<T>) =>
    new Observable<T>((observer) =>
      source$.subscribe({
        ...forwardObserver(observer),
        next: (v) => filterFunc(v) && observer.next(v)
      })
    );
}

// 🌟 Put the counter inside of the new observer's scope
// so that it restarts count for each subscription
export function myTake<T>(n: number) {
  return (source$: Observable<T>) =>
    new Observable<T>((observer) => {
      let counter = 0;
      return source$.subscribe({
        ...forwardObserver(observer),
        next: (v) => (counter++ === n ? observer.complete() : observer.next(v))
      });
    });
}

export function myFirst<T>() {
  return myTake<T>(1);
}

export function mySkip<T>(n: number) {
  return (source$: Observable<T>) =>
    new Observable<T>((observer) => {
      let counter = 0;
      return source$.subscribe({
        ...forwardObserver(observer),
        next: (v) => counter++ < n || observer.next(v)
      });
    });
}

export function myTakeLast<T>(n: number) {
  return (source$: Observable<T>) =>
    new Observable<T>((observer) => {
      let buffer: T[] = [];
      return source$.subscribe({
        ...forwardObserver(observer),
        next: (v) => {
          buffer.length === n && buffer.shift();
          buffer.push(v);
        },
        complete: () => {
          buffer.forEach((v) => observer.next(v));
          observer.complete();
        }
      });
    });
}

export function myLast<T>() {
  return myTakeLast<T>(1);
}

export function myConcatWith<T, R>(o$: Observable<R>) {
  return (source$: Observable<T>) =>
    new Observable<T | R>((observer) =>
      source$.subscribe({
        ...forwardObserver(observer),
        complete: () => {
          o$.subscribe(observer);
        }
      })
    );
}

export function myStartWith<T, R>(s: R) {
  return (source$: Observable<T>) =>
    new Observable<T | R>((observer) => {
      observer.next(s);
      return source$.subscribe({
        ...forwardObserver(observer)
      });
    });
}

export function myMergeWith(...streams$: Observable<any>[]) {
  return (source$: Observable<any>) =>
    new Observable<any>((observer) => {
      const allStreams$ = [source$, ...streams$];
      const groupSubscription = new GroupSubscription();
      const groupComplete = createGroupComplete(
        allStreams$.length,
        observer.complete.bind(observer)
      );
      allStreams$.forEach((s$, i) => {
        const inObserver = {
          ...forwardObserver(observer),
          complete: groupComplete
        };
        groupSubscription.add(s$.subscribe(inObserver));
      });
      return groupSubscription;
    });
}

export function myCombineLatestWith(...streams$: Observable<any>[]) {
  return (source$: Observable<any>) =>
    new Observable<any>((observer) => {
      const allStreams$ = [source$, ...streams$];
      const { values, gotValue } = createValueCache(allStreams$);
      const groupSubscription = new GroupSubscription();
      const groupComplete = createGroupComplete(
        allStreams$.length,
        observer.complete.bind(observer)
      );
      allStreams$.forEach((s$, i) => {
        const inObserver = {
          ...forwardObserver(observer),
          next: (v: any) => {
            values[i] = v;
            gotValue[i] = true;
            if (gotValue.every((bool) => bool)) {
              observer.next([...values]);
            }
          },
          complete: groupComplete
        };
        groupSubscription.add(s$.subscribe(inObserver));
      });
      return groupSubscription;
    });
}

export function myWithLatestFrom(...streams$: Observable<any>[]) {
  return (source$: Observable<any>) =>
    new Observable<any>((observer) => {
      const { values, gotValue } = createValueCache(streams$);
      const groupSubscription = new GroupSubscription();
      streams$.forEach((s$, i) => {
        const inSubscription = s$.subscribe((v) => {
          values[i] = v;
          gotValue[i] = true;
        });
        groupSubscription.add(inSubscription);
      });
      const sourceSubscription = source$.subscribe({
        ...forwardObserver(observer),
        next: (x) => {
          if (gotValue.every((bool) => bool)) {
            observer.next([x, ...values]);
          }
        }
      });
      groupSubscription.add(sourceSubscription);
      return groupSubscription;
    });
}

//https://github.com/ReactiveX/rxjs/blob/master/src/internal/observable/zip.ts
export function myZipWith(...streams$: Observable<any>[]) {
  return (source$: Observable<any>) =>
    new Observable<any>((observer) => {
      const allStreams$ = [source$, ...streams$];
      // A collection of buffers of values from each source.
      // Keyed by the same index with which the sources were passed in.
      const buffers: unknown[][] = allStreams$.map(() => []);

      // An array of flags of whether or not the sources have completed.
      // This is used to check to see if we should complete the result.
      // Keyed by the same index with which the sources were passed in.
      const completed = allStreams$.map(() => false);
      const groupSubscription = new GroupSubscription();
      allStreams$.forEach((s$, i) => {
        const inObserver = {
          ...forwardObserver(observer),
          next: (v: any) => {
            /**
             * Tetris approach
             */
            buffers[i].push(v);
            // if every buffer has at least one value in it, then we
            // can shift out the oldest value from each buffer and emit
            // them as an array.
            if (buffers.every((buffer) => buffer.length)) {
              const result = buffers.map((buffer) => buffer.shift());
              observer.next(result);
              // If any one of the sources is both complete and has an empty buffer
              // then we complete the result. This is because we cannot possibly have
              // any more values to zip together.
              if (buffers.some((buffer) => !buffer.length) && completed[i]) {
                observer.complete();
              }
            }
          },
          complete: () => {
            // This source completed. Mark it as complete so we can check it later
            // if we have to.
            completed[i] = true;
            // But, if this complete source has nothing in its buffer, then we
            // can complete the result, because we can't possibly have any more
            // values from this to zip together with the other values.
            !buffers[i].length && observer.complete();
          }
        };
        groupSubscription.add(s$.subscribe(inObserver));
      });
      return groupSubscription;
    });
}

export function myScan<A, V>(
  accumulator: (acc: A, cur: V, index: number) => A,
  init: A
) {
  return (source$: Observable<any>) =>
    new Observable<A>((observer) => {
      let acc = init;
      let counter = 0;
      return source$.subscribe({
        ...forwardObserver(observer),
        next: (x) => {
          acc = accumulator(acc, x, counter++);
          observer.next(acc);
        }
      });
    });
}

// myDelay()
// use setTimeout()

// myDebounce()
// use setTimeout() to set a flag `emitReady: boolean`
// In next():
// - emit ifs emitReady ==== true
// - clear the previous timeout
// - reset emitReady = false
// - start a new timeout

// myThrottle()
// use setTimeout() to set a flag `emitReady: boolean`
// In next():
// - emit if emitReady ==== true
// - if no timeout
//   - reset emitReady = false
//   - start a new timeout

// myDistinct(comparator, flusher$)
// use buffer: [] to buffer previous value
// In next(x):
// - buffer.some(b => comparator(x))
// - if false, emit x, push x to buffer
//
// In flusher$ next()
// - buffer.splice(0, buffer.length

// myDistinctUntilChanged()
// use buffer: any to buffer ONE previous value
// In next(x):
// - buffer === x
// - if false, emit x, buffer = x

/**
 * myCatch
 *
 * retry(2) equavalent
 * myCatch((e, caught$) => {
 *   if (counter++ < 2) {
 *     return caught$;
 *   } else {
 *     return empty();
 *   }
 * })
 *  */
export function myCatch<A>(
  selector: (err: any, caught: Observable<A>) => Observable<any>
) {
  return (source$: Observable<A>): Observable<A> =>
    new Observable<A>((observer) => {
      return source$.subscribe({
        ...forwardObserver(observer),
        // 🌟 Use recursion to pass this observable to selector again
        error: (e) =>
          selector(e, myCatch(selector)(source$)).subscribe({
            ...forwardObserver(observer)
          })
      });
    });
}
