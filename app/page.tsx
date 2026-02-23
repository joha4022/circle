import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <p className="kicker">Private birthday planning for friend groups</p>
        <h1>
          Plan better birthday gifts,
          <br />
          without spoiling the surprise.
        </h1>
        <p className="muted" style={{ maxWidth: 680 }}>
          Circle creates private birthday planning threads, excludes the birthday person from the group chat, and lets everyone vote before checkout handoff.
        </p>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link href="/login" className="button alt">
            Start with Google
          </Link>
          <Link href="/dashboard" className="button ghost">
            Open dashboard
          </Link>
        </div>
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 4" }}>
          <h3>Sign in</h3>
          <p className="muted">Connect with Google and join your friend circle in one step.</p>
        </article>
        <article className="card" style={{ gridColumn: "span 4" }}>
          <h3>Complete profile</h3>
          <p className="muted">Save birthday + address so shipping details are ready when gifting starts.</p>
        </article>
        <article className="card" style={{ gridColumn: "span 4" }}>
          <h3>Plan and vote</h3>
          <p className="muted">Run private gift discussions, vote on options, and finalize a winner.</p>
        </article>
      </section>
    </main>
  );
}
