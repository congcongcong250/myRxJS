import "./styles.css";
import { mergeWith } from "rxjs";
import StreamPrinter from "./components/StreamPrinter";
import { getStreams } from "./samples/streams";

const { stream1$, stream2$, stream3$, stream4$ } = getStreams();
const merged$ = stream1$.pipe(mergeWith(stream2$, stream3$, stream4$));

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <StreamPrinter stream$={merged$} />
    </div>
  );
}
