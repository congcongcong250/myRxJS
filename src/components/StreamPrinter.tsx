import "./styles.css";
import { ReactNode, useEffect, useRef, useState } from "react";
import { map, Observable, startWith } from "rxjs";

function getDifference(now: Date, start: Date) {
  const difference = String(now.valueOf() - start.valueOf()).padStart(4, "0");
  return `${difference.slice(0, -3)}.${difference.slice(-3)}s`;
}

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

  const startRef = useRef<undefined | Date>();

  useEffect(() => {
    startRef.current = undefined;
    const subscription = stream$
      .pipe(
        startWith(starter),
        map((node) => {
          const now = new Date();
          startRef.current =
            startRef.current === undefined ? now : startRef.current;
          const difference = getDifference(now, startRef.current);
          return (
            <>
              <span className="stream-printer-event atom-block">{node}</span> at{" "}
              <code className="stream-printer-sec-stamp atom-block">
                {difference}
              </code>
              {verbose && (
                <>
                  <p>Start: {startRef.current.toISOString()}</p>
                  <p>Now: {now.toISOString()}</p>
                </>
              )}
            </>
          );
        })
      )
      .subscribe({
        next: (ev: ReactNode) => println(ev),
        error: (e) => {
          const now = new Date();
          println(
            <div className="stream-printer-meta-line stream-printer-error">
              {e.message || e.toString()} at
              <code className="stream-printer-sec-stamp atom-block">
                {startRef.current
                  ? getDifference(new Date(), startRef.current)
                  : "Not events"}
              </code>
              {verbose && (
                <>
                  <p>
                    Start:{" "}
                    {startRef.current
                      ? startRef.current.toISOString()
                      : "Not events"}
                  </p>
                  <p>Now: {now.toISOString()}</p>
                </>
              )}
            </div>
          );
        },
        complete: () => {
          const now = new Date();
          println(
            <div className="stream-printer-meta-line stream-printer-complete">
              DONE at
              <code className="stream-printer-sec-stamp atom-block">
                {startRef.current
                  ? getDifference(new Date(), startRef.current)
                  : "Not events"}
              </code>
              {verbose && (
                <>
                  <p>
                    Start:{" "}
                    {startRef.current
                      ? startRef.current.toISOString()
                      : "Not events"}
                  </p>
                  <p>Now: {now.toISOString()}</p>
                </>
              )}
            </div>
          );
        }
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
