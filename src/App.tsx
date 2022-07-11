import "./styles.css";
import StreamPrinter from "./components/StreamPrinter";
import { getStreams } from "./samples/streams";
import {
  myCombineLatestWith,
  myMergeWith
} from "./custom-pipeable-operator/common";
import { combineLatestWith, zipWith } from "rxjs";

const { stream1$, stream2$, stream3$, stream4$ } = getStreams();
const merged$ = stream1$.pipe(zipWith(stream2$, stream3$, stream4$));

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      {/* <StreamPrinter stream$={merged$} /> */}
      <StreamPrinter stream$={stream4$} />
    </div>
  );
}
