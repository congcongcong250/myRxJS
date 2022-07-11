import {
  from,
  of,
  delay,
  concatMap,
  interval,
  takeWhile,
  map,
  timer,
  mergeMap,
  zip,
  combineLatestWith,
  take
} from "rxjs";

export enum UNIT {
  _SEC = 1000,
  _500MS = 500,
  _100MS = 100
}

export function getStreams(unit: UNIT = UNIT._100MS) {
  const streams$ = {
    // 1 sec interval
    stream1$: from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]).pipe(
      concatMap((x) => of(x).pipe(delay(1 * unit)))
    ),
    /**
     * `zip()`
     * Eager completes
     * as long as the SHORTEST stream completes
     * */
    // 2 sec interval
    stream2$: zip([interval(2 * unit), of("🤔", "💪🏻", "✅", "👍", "📈")]).pipe(
      map(([_, emoji]) => emoji)
    ),
    // 3 sec interval
    // complete at (4 + 1) x (3 x unit) time
    stream3$: interval(3 * unit).pipe(
      map((i) => ["{||}", "<||>", "[||]", "\\||/"][i]),
      takeWhile((v) => v !== undefined)
    ),
    stream4$: ((l) =>
      interval(4 * unit).pipe(
        mergeMap((i) => of(l[i])),
        take(l.length)
      ))(["XX", "YY", "ZZ"])
  };
  return streams$;
}
