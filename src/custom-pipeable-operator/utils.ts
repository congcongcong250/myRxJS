import { Observable, Observer, Subscriber, Subscription } from "rxjs";

export function forwardObserver<T>(observer: Subscriber<T>) {
  return {
    next: (x: T) => observer.next(x),
    error: (e: any) => observer.error(e),
    complete: () => observer.complete()
  };
}

export const createGroupComplete = (
  completeThreshold: number,
  onComplete: Function
) => {
  let completeCounter = 0;
  return () => {
    if (++completeCounter === completeThreshold) {
      onComplete();
    }
  };
};

export class GroupSubscription {
  subscriptions: Subscription[] = [];

  add = (subscription: Subscription) => {
    this.subscriptions.push(subscription);
  };

  unsubscribe = () => {
    this.subscriptions.forEach(function (subscription) {
      subscription.unsubscribe();
    });
  };
}
