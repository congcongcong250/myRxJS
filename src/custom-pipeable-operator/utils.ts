import { Subscriber } from "rxjs";

export function forwardObserver<T>(observer: Subscriber<T>) {
  return {
    next: (x: T) => observer.next(x),
    error: (e: any) => observer.error(e),
    complete: () => observer.complete()
  };
}
