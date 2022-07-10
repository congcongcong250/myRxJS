import { from, of, delay, concatMap } from "rxjs";

enum UNIT {
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
    // 2 sec interval
    stream2$: from(["🤔", "💪🏻", "✅", "👍", "📈"]).pipe(
      concatMap((x) => of(x).pipe(delay(2 * unit)))
    ),
    // 3 sec interval
    stream3$: from(["{||}", "<||>", "[||]", "||/"]).pipe(
      concatMap((x) => of(x).pipe(delay(3 * unit)))
    ),
    // 4 sec interval
    stream4$: from(["XX", "YY", "ZZ"]).pipe(
      concatMap((x) => of(x).pipe(delay(4 * unit)))
    )
  };
  return streams$;
}
