import { Observable } from "rxjs";
import {
  createGroupComplete,
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
      const values = new Array(allStreams$.length).fill(undefined);
      const gotValue = new Array(allStreams$.length).fill(false);
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
      const values = new Array(streams$.length).fill(undefined);
      const gotValue = new Array(streams$.length).fill(false);
      streams$.forEach((s$, i) =>
        s$.subscribe((v) => {
          values[i] = v;
          gotValue[i] = true;
        })
      );
      return source$.subscribe({
        ...forwardObserver(observer),
        next: (x) => {
          if (gotValue.every((bool) => bool)) {
            observer.next([x, ...values]);
          }
        }
      });
    });
}
