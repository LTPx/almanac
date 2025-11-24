import Link from "next/link";
import "./styles.css";

export default function HomePage() {
  return (
    <main className="home-container">
      <header className="home-hero text-center">
        <h1>Almanac by Openmind</h1>
        <p className="hero-subtitle">
          A learning platform that rewards progress. Study, earn tokens, and
          unlock collectible achievements.
        </p>

        <div className="hero-actions">
          <Link href="/sign-up" className="btn-primary">
            Create Account
          </Link>
        </div>
      </header>

      <section className="home-section bg-card">
        <h2>What is Almanac?</h2>
        <p>
          Almanac is an educational web and Android application designed to help
          you learn efficiently through structured units, interactive tests,
          daily practice, and optional reward systems.
        </p>
        <p>
          Users can access free content supported by ads or subscribe to a
          premium plan for an ad-free experience.
        </p>
      </section>

      <section className="home-section">
        <h2>Main Features</h2>
        <ul className="feature-list">
          <li>📘 Structured learning units and tests</li>
          <li>🔥 Daily streaks and practice tracking</li>
          <li>🎁 Rewarded tokens for completing ads</li>
          <li>⭐ Optional premium subscription (no ads)</li>
          <li>🎨 Non-financial NFT collectibles across key milestones</li>
          <li>🔐 Secure login with email or Google Sign-In</li>
        </ul>
      </section>

      <section className="home-section">
        <h2>Safe, Transparent, and Privacy-First</h2>
        <p>
          Almanac follows a privacy-by-design approach and complies with GDPR,
          ePrivacy, and international standards. Ads follow Google’s Consent
          Mode v2 and non-personalized rules where required.
        </p>
        <p>You can review our policies at any time:</p>

        <ul>
          <li>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/terms">Terms of Service</Link>
          </li>
          <li>
            <Link href="/legal-notice">Legal Notice</Link>
          </li>
        </ul>
      </section>

      <footer className="home-footer">
        <p>
          © {new Date().getFullYear()} Almanac by Openmind. All rights
          reserved.
        </p>
        <p className="footer-links">
          <Link href="/privacy-policy">Privacy</Link> ·{" "}
          <Link href="/terms">Terms</Link> ·{" "}
          <Link href="/legal-notice">Legal Notice</Link>
        </p>
      </footer>
    </main>
  );
}
