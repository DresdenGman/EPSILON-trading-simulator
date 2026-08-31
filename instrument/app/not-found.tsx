import Link from "next/link";

export default function NotFound() {
  return <main className="error-shell"><p className="eyebrow">404 / outside the field</p><h1>This coordinate<br /><span>was not observed.</span></h1><p>The requested page is not part of the current EPSILON instrument.</p><Link href="/">Return to field notes →</Link></main>;
}
