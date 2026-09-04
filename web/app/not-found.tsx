import Link from "next/link"

export default function NotFound() {
  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you requested does not exist.</p>
      <p>
        <Link href="/" style={{ color: "#0070f3", textDecoration: "underline" }}>
          Return to Homepage
        </Link>
      </p>
    </main>
  )
}
