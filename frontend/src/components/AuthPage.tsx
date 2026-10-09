import { useState, type FormEvent } from "react";
import { api, getErrorMessage, type AuthUser } from "../api/client";

interface AuthPageProps {
  initialMessage?: string;
  onLogin: (email: string, password: string) => Promise<AuthUser>;
  onRegister: (fullName: string, email: string, password: string) => Promise<void>;
}

function AuthPage({ initialMessage, onLogin, onRegister }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const normalizedEmail = email.trim();
    if (mode === "register") {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        setError("Enter your full name.");
        return;
      }
      if (password.length < 12 || password.length > 128) {
        setError("Your password must be between 12 and 128 characters.");
        return;
      }
      setLoading(true);
      try {
        await onRegister(trimmedName, normalizedEmail, password);
        setMode("login");
        setFullName("");
        setPassword("");
        setNotice("Account created. Sign in with your email and password to continue.");
      } catch (registerError) {
        setError(getErrorMessage(registerError));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!normalizedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await onLogin(normalizedEmail, password);
      setPassword("");
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>TalentPilot <strong>AI</strong></span>
        </div>
        <p className="eyebrow auth-eyebrow">RECRUITING, WITH CLARITY</p>
        <h1 id="auth-title">{mode === "login" ? "Welcome back." : "Create your account."}</h1>
        <p className="auth-description">
          {mode === "login"
            ? "Sign in to continue to your recruiting workspace."
            : "Set up your recruiter account to get started."}
        </p>

        {initialMessage && <p className="notice error-notice" role="alert">{initialMessage}</p>}
        {notice && <p className="notice success-notice" role="status">{notice}</p>}
        {error && <p className="notice error-notice" role="alert">{error}</p>}

        <form className="entry-form auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full name <span className="required-mark">*</span>
              <input
                autoComplete="name"
                maxLength={120}
                onChange={(event) => setFullName(event.target.value)}
                required
                value={fullName}
              />
            </label>
          )}
          <label>
            Email <span className="required-mark">*</span>
            <input
              autoComplete="email"
              maxLength={254}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password <span className="required-mark">*</span>
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              maxLength={128}
              minLength={mode === "register" ? 12 : 1}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            {mode === "register" && (
              <span className="field-hint">Use 12–128 characters.</span>
            )}
          </label>
          <button className="primary-button auth-submit" disabled={loading} type="submit">
            {loading
              ? mode === "login" ? "Signing in…" : "Creating account…"
              : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "New to TalentPilot?" : "Already have an account?"}
          <button
            className="auth-switch-button"
            disabled={loading}
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setNotice("");
            }}
            type="button"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="auth-session-note">
          Your sign-in lasts for this browser session. Reloading the page requires signing in again.
        </p>
      </section>
    </main>
  );
}

export default AuthPage;
