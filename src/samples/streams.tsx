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
  combineLatestWith
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
     * Eagerly completes
     * as long as one of the source completes
     * */
    // 2 sec interval
    stream2$: zip([interval(2 * unit), of("🤔", "💪🏻", "✅", "👍", "📈")]).pipe(
      map((x) => x[1])
    ),
    // 3 sec interval
    stream3$: interval(3 * unit).pipe(
      map((i) => ["{||}", "<||>", "[||]", "\\||/"][i]),
      takeWhile((v) => v !== undefined)
    ),
    // 4 sec interval
    stream4$: timer(4 * unit).pipe(mergeMap((i) => of(["XX", "YY", "ZZ"][i])))
  };
  return streams$;
}
