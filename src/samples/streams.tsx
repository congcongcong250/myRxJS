import { concatMap, delay, from, of } from "rxjs";
import { myStartWith } from "../custom-pipeable-operator/common";

export const stream2$ = from(["a", "b", "c"]).pipe(
  concatMap((x) => of(x).pipe(delay(600)))
);

export const stream3$ = from(["🤔", "💪🏻", "✅"]).pipe(
  concatMap((x) => of(x).pipe(delay(100)))
);

export const stream4$ = from([<b>hi</b>, <b>go</b>, <b>to</b>]).pipe(
  concatMap((x) => of(x).pipe(delay(300))),
  myStartWith("!START!")
);
