import "./styles.css";
import StreamPrinter from "./components/StreamPrinter";
import { getStreams } from "./samples/streams";
import {
  myCombineLatestWith,
  myMergeWith,
  myScan,
  myBuffer,
  myBufferTime,
  myZipWith,
  myCatch
} from "./custom-pipeable-operator/common";
import {
  combineLatestWith,
  map,
  of,
  scan,
  zipWith,
  catchError,
  empty
} from "rxjs";

const { stream1$, stream2$, stream3$, stream4$ } = getStreams();
const merged$ = stream1$.pipe(myZipWith(stream2$, stream3$, stream4$));

let counter = 0;
const catchAndRetry$ = stream1$.pipe(
  map((x) => {
    if (x === 3) {
      throw new Error("error");
    }
    return x;
  }),
  myCatch((e, caught$) => {
    if (counter++ < 2) {
      return caught$;
    } else {
      return empty();
    }
  })
);

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <StreamPrinter stream$={catchAndRetry$} />
      {/* <StreamPrinter stream$={stream4$} /> */}
    </div>
  );
}
