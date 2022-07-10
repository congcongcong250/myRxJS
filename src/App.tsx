import "./styles.css";
import { from, of, delay, map, concatMap } from "rxjs";
import StreamPrinter from "./components/StreamPrinter";
import { getStreams } from "./samples/streams";

const { stream1$, stream2$, stream3$, stream4$ } = getStreams();

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <StreamPrinter stream$={stream1$} />
    </div>
  );
}
