import Link from "next/link";
import { Bebas_Neue, Manrope } from "next/font/google";
import styles from "./page.module.css";

const displayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const steps = [
  {
    title: "Start a private circle",
    description: "Create a gift thread without the birthday person so planning stays truly surprising."
  },
  {
    title: "Share ideas and narrow options",
    description: "Drop links, compare budgets, and discuss pros and cons with your group in one place."
  },
  {
    title: "Vote, then hand off checkout",
    description: "Pick the winner together and move to purchase with clarity on what everyone approved."
  }
] as const;

const highlights = [
  {
    title: "Private by design",
    description: "Birthday members are excluded from planning discussions automatically."
  },
  {
    title: "Decision-ready threads",
    description: "Every discussion centers around options, tradeoffs, and final selection."
  },
  {
    title: "Built for friend groups",
    description: "Fast setup, low friction, and clear participation from everyone in the circle."
  },
  {
    title: "Less chaos, better gifts",
    description: "One thread replaces scattered DMs and last-minute guesswork."
  }
] as const;

const sampleMessages = [
  "Maya's birthday is in 13 days. Ideas?",
  "Budget cap still $45 each?",
  "Vote seems to favor the espresso setup.",
  "Checkout owner assigned to Keira."
] as const;

export default function HomePage() {
  return (
    <main className={`${styles.page} ${displayFont.variable} ${bodyFont.variable}`}>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Private birthday planning for friend groups</p>
          <h1 className={styles.heroTitle}>Plan unforgettable gifts without breaking the surprise.</h1>
          <p className={styles.heroBody}>
            Circle gives your group a focused place to brainstorm, compare options, and vote before anyone checks out.
          </p>
          <div className={styles.heroActions}>
            <Link href="/login" className={`${styles.cta} ${styles.ctaPrimary}`}>
              Start with Google
            </Link>
            <Link href="/groups" className={`${styles.cta} ${styles.ctaSecondary}`}>
              Open groups
            </Link>
          </div>
        </div>
        <aside className={styles.liveRail} aria-label="Example planning chat">
          <p className={styles.liveTitle}># gift-planning-live</p>
          <div className={styles.liveMessages}>
            {sampleMessages.map((msg) => (
              <p key={msg}>{msg}</p>
            ))}
          </div>
        </aside>
        <div className={styles.heroTexture} aria-hidden />
      </section>

      <section className={styles.howItWorks} aria-labelledby="how-it-works">
        <h2 id="how-it-works" className={styles.sectionTitle}>
          How it works
        </h2>
        <div className={styles.stepGrid}>
          {steps.map((step, index) => (
            <article key={step.title} className={styles.stepCard}>
              <p className={styles.stepNumber}>0{index + 1}</p>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.trustStrip} aria-label="Social proof">
        <p>Used by friend groups that plan ahead, decide faster, and gift with confidence.</p>
        <ul>
          <li>Private circles</li>
          <li>Focused discussions</li>
          <li>Clear voting flow</li>
          <li>Checkout handoff ready</li>
        </ul>
      </section>

      <section className={styles.highlights} aria-labelledby="highlights">
        <h2 id="highlights" className={styles.sectionTitle}>
          Why groups choose Circle
        </h2>
        <div className={styles.highlightGrid}>
          {highlights.map((item) => (
            <article key={item.title} className={styles.highlightCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <h2>Make birthdays feel coordinated, not chaotic.</h2>
        <p>Start your next gift plan in minutes and keep the surprise intact.</p>
        <div className={styles.heroActions}>
          <Link href="/login" className={`${styles.cta} ${styles.ctaPrimary}`}>
            Start with Google
          </Link>
          <Link href="/groups" className={`${styles.cta} ${styles.ctaSecondary}`}>
            Open groups
          </Link>
        </div>
      </section>
    </main>
  );
}
