import "./styles.css";
import { from, of, delay, map, concatMap, Observable } from "rxjs";
import StreamPrinter from "./components/StreamPrinter";
import { useEffect, useState } from "react";

const stream$ = from([1, 2, 3]).pipe(
  map((x) => x * x),
  concatMap((x) => of(x).pipe(delay(500)))
);

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <StreamPrinter stream$={stream$} />
    </div>
  );
}
