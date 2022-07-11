import { Observable, Subscription } from "rxjs";
import { forwardObserver } from "./utils";

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
      const groupComplete = ((completeThreshold) => {
        let completeCounter = 0;
        return () => {
          if (++completeCounter === completeThreshold) {
            observer.complete();
          }
        };
      })(streams$.length + 1);
      const groupSubscription: Subscription[] = [];
      [source$, ...streams$].forEach((s$) => {
        groupSubscription.push(
          s$.subscribe({
            ...forwardObserver(observer),
            complete: groupComplete
          })
        );
      });
      return {
        unsubscribe: () => {
          groupSubscription.forEach((s) => s.unsubscribe());
        }
      };
    });
}

export function myCombineLatestWith(...streams$: Observable<any>[]) {
  return (source$: Observable<any>) =>
    new Observable<any>((observer) => {
      const allStream$ = [source$, ...streams$];
      const values = new Array(allStream$.length).fill(undefined);
      const gotValue = new Array(allStream$.length).fill(false);
      const groupComplete = ((completeThreshold, onComplete) => {
        let completeCounter = 0;
        return () => {
          if (++completeCounter === completeThreshold) {
            onComplete();
          }
        };
      })(streams$.length + 1, observer.complete.bind(observer));
      const groupSubscription: Subscription[] = [];
      allStream$.forEach((s$, i) => {
        groupSubscription.push(
          s$.subscribe({
            ...forwardObserver(observer),
            next: (v) => {
              values[i] = v;
              gotValue[i] = true;
              if (gotValue.every((bool) => bool)) {
                console.log(gotValue);
                observer.next([...values]);
              }
            },
            complete: groupComplete
          })
        );
      });
      return {
        unsubscribe: () => {
          groupSubscription.forEach((s) => s.unsubscribe());
        }
      };
    });
}
