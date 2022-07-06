import { ReactNode, useEffect, useRef, useState } from "react";
import { map, Observable } from "rxjs";

export default function StreamPrinter({
  stream$
}: {
  stream$: Observable<ReactNode>;
}) {
  const [outputList, setOutputList] = useState<ReactNode[]>([]);
  const println = (newLine: ReactNode) => {
    console.log(newLine);
    setOutputList((prev) => [...prev, newLine]);
  };

  useEffect(() => {
    const subscription = stream$
      .pipe(
        map((line) => {
          return (
            <>
              {line} at ${new Date().toISOString()}
            </>
          );
        })
      )
      .subscribe({
        next: (ev: ReactNode) => println(ev),
        error: (e) =>
          println(
            <div style={{ backgroundColor: "red" }}>
              {e.message || e.toString()}
            </div>
          ),
        complete: () =>
          println(<div style={{ backgroundColor: "green" }}>DONE</div>)
      });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="stream-printer">
      <h3>stream printer</h3>
      {outputList.map((line, index) => (
        <div key={index} style={{ marginTop: "10px", marginBottom: "10px" }}>
          {line}
        </div>
      ))}
    </div>
  );
}
