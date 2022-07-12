import "./styles.css";
import StreamPrinter from "./components/StreamPrinter";
import { getStreams } from "./samples/streams";
import {
  myCombineLatestWith,
  myMergeWith,
  myScan,
  myBuffer,
  myBufferTime,
  myZipWith
} from "./custom-pipeable-operator/common";
import { combineLatestWith, scan, zipWith } from "rxjs";

const { stream1$, stream2$, stream3$, stream4$ } = getStreams();
const merged$ = stream1$.pipe(myZipWith(stream2$, stream3$, stream4$));
const buffer$ = stream1$.pipe(myBufferTime(550));

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <StreamPrinter stream$={buffer$} />
      {/* <StreamPrinter stream$={stream4$} /> */}
    </div>
  );
}
