interface MyObserver {
  next(value: any): void;
  error(error: any): void;
  complete(): void;
}

interface MySubscription {
  unsubscribe(): void;
}

type NextFnOrObserver = ((value: any) => void) | MyObserver;

class MyObservable {
  subscribeFn: (observer: MyObserver) => void;
  defaultObserver: MyObserver = {
    next: (value: any) => {},
    error: (error: any) => {},
    complete: () => {}
  };

  constructor(subscribeFn: (observer: MyObserver) => MySubscription) {
    this.subscribeFn = subscribeFn;
  }

  subscribe(nextFnOrObserver: NextFnOrObserver) {
    if (typeof nextFnOrObserver === "function") {
      return this.subscribeFn({
        ...this.defaultObserver,
        next: nextFnOrObserver
      });
    }
    return this.subscribeFn(nextFnOrObserver);
  }

  pipe(
    this: MyObservable,
    ...args: Array<(source$: MyObservable) => MyObservable>
  ) {
    return args.reduce((acc, cur) => cur(acc), this);
  }
}
