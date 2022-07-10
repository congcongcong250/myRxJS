import "./styles.css";
import { ReactNode, useEffect, useState } from "react";
import { map, Observable, startWith } from "rxjs";
import { UNIT } from "../samples/streams";

export default function StreamPrinter({
  stream$,
  starter = "-- Start --",
  verbose = false
}: {
  stream$: Observable<ReactNode>;
  verbose?: boolean;
  starter?: ReactNode | null;
}) {
  const [outputList, setOutputList] = useState<ReactNode[]>([]);
  const println = (newLine: ReactNode) => {
    verbose && console.log(newLine);
    setOutputList((prev) => [...prev, newLine]);
  };

  useEffect(() => {
    let start: undefined | Date;
    const subscription = stream$
      .pipe(
        startWith(starter),
        map((node) => {
          const now = new Date();
          start = start === undefined ? now : start;
          const difference = String(now.valueOf() - start.valueOf()).padStart(
            4,
            "0"
          );
          return (
            <>
              <span className="stream-printer-event atom-block">{node}</span> at{" "}
              <code className="stream-printer-sec-stamp atom-block">
                {difference.slice(0, -3)}.{difference.slice(-3)}s
              </code>
              {verbose && (
                <>
                  <p>Start: {start.toISOString()}</p>
                  <p>Now: {now.toISOString()}</p>
                </>
              )}
            </>
          );
        })
      )
      .subscribe({
        next: (ev: ReactNode) => println(ev),
        error: (e) =>
          println(
            <div className="stream-printer-error">
              {e.message || e.toString()}
            </div>
          ),
        complete: () =>
          println(<div className="stream-printer-complete">DONE</div>)
      });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="stream-printer">
      <h3>stream printer</h3>
      {outputList.map((line, index) => (
        <div key={index} className="stream-printer-event-line">
          {line}
        </div>
      ))}
    </div>
  );
}
