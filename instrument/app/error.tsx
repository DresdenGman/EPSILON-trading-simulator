"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="error-shell"><p className="eyebrow">System interruption</p><h1>The field could not<br /><span>be completed.</span></h1><p>No result has been accepted. Retry the computation or return to the instrument.</p><button onClick={reset}>Retry safely →</button></main>;
}
