import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <p className="kicker">Birthday circles, minus the spoiler</p>
        <h1>
          Plan gifts together.
          <br />
          Keep the birthday friend out of the chat.
        </h1>
        <p className="muted" style={{ maxWidth: 680 }}>
          Circle lets friends create private planning threads for upcoming birthdays, vote on a gift, and hand off to a payment flow when the winner is chosen.
        </p>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <Link href="/login" className="button alt">
            Start with Google
          </Link>
          <Link href="/dashboard" className="button ghost">
            View dashboard
          </Link>
        </div>
      </section>

      <section className="grid">
        <article className="card" style={{ gridColumn: "span 4" }}>
          <h3>1. Join with Google</h3>
          <p className="muted">Fast onboarding with your existing account.</p>
        </article>
        <article className="card" style={{ gridColumn: "span 4" }}>
          <h3>2. Add birthday + address</h3>
          <p className="muted">Store shipping details to deliver gifts to the right place.</p>
        </article>
        <article className="card" style={{ gridColumn: "span 4" }}>
          <h3>3. Chat + vote + checkout</h3>
          <p className="muted">Private planning thread excludes the birthday person by default.</p>
        </article>
      </section>
    </main>
  );
}
