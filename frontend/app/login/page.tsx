import Link from "next/link";
import "../../desktop/style.css";

export default function LoginPage() {
  return (
    <main className="login-outer">
      <header className="login-header">
        <div className="login-header-logo">
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "#0D7A5F",
              borderRadius: "8px",
            }}
          />
          <span>MyAccess</span>
        </div>

        <nav className="login-header-nav">
          <a href="#">About</a>
          <a href="#">How it works</a>
          <a href="#">Contact</a>
          <a href="#" className="btn btn-primary">
            Sign up free
          </a>
        </nav>
      </header>

      <section>
        <h1>Login</h1>
        <p>Welcome back to MyAccess.</p>
      </section>

      <Link href="/map">Go to Map</Link>
      <br />
      <Link href="/report">Go to Report</Link>
    </main>
  );
}