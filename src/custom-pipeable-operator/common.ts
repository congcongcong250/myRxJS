import { Observable } from "rxjs";

export function myMap<T, R>(transformer: (x: T) => R) {
  return (source$: Observable<T>) =>
    new Observable<R>((observer) => {
      source$.subscribe({
        error: observer.error,
        complete: observer.complete,
        next: (v) => observer.next(transformer(v))
      });
    });
}

export function myMapTo<R>(x: R) {
  return (source$: Observable<any>) =>
    new Observable<R>((observer) => {
      source$.subscribe({
        error: observer.error,
        complete: observer.complete,
        next: (v) => observer.next(x)
      });
    });
}

export function myTap<T>(process: (x: T) => void) {
  return (source$: Observable<T>) =>
    new Observable((observer) => {
      source$.subscribe({
        error: observer.error,
        complete: observer.complete,
        next: (v) => {
          process(v);
          return observer.next(v);
        }
      });
    });
}

export function myFilter<T>(filterFunc: (x: T) => boolean) {
  return (source$: Observable<T>) =>
    new Observable<T>((observer) => {
      source$.subscribe({
        error: observer.error,
        complete: observer.complete,
        next: (v) => filterFunc(v) && observer.next(v)
      });
    });
}

// 🌟 Put the counter inside of the new observer's scope
// so that it restarts count for each subscription
export function myTake<T>(n: number) {
  return (source$: Observable<T>) =>
    new Observable<T>((observer) => {
      let counter = 0;
      source$.subscribe({
        error: observer.error,
        complete: observer.complete,
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
      source$.subscribe({
        error: observer.error,
        complete: observer.complete,
        next: (v) => counter++ < n || observer.next(v)
      });
    });
}

export function myTakeLast<T>(n: number) {
  return (source$: Observable<T>) =>
    new Observable<T>((observer) => {
      let buffer: T[] = [];
      source$.subscribe({
        error: observer.error,
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

export function myConcatWith<T, R>(o: Observable<R>) {
  return (source$: Observable<T>) =>
    new Observable<T | R>((observer) => {
      source$.subscribe({
        error: observer.error,
        next: observer.next,
        complete: () => {
          o.subscribe(observer);
        }
      });
    });
}

export function myStartWith<T, R>(o: Observable<R>) {
  return (source$: Observable<T>) =>
    new Observable<T | R>((observer) => {
      source$.subscribe({
        error: observer.error,
        next: observer.next,
        complete: () => {
          o.subscribe(observer);
        }
      });
    });
}
