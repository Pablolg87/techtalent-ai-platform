import { useState } from "react";
import CandidatesPage from "./components/CandidatesPage";
import JobsPage from "./components/JobsPage";
import MatchingPage from "./components/MatchingPage";

type Screen = "home" | "jobs" | "candidates" | "matching";
const navigationItems = ["Jobs", "Candidates", "Matching"] as const;
const navigationTargets: Record<(typeof navigationItems)[number], Screen> = {
  Jobs: "jobs",
  Candidates: "candidates",
  Matching: "matching",
};

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          aria-label="TalentPilot AI home"
          onClick={() => setScreen("home")}
        >
          <span className="brand-mark" aria-hidden="true">T</span>
          <span>TalentPilot <strong>AI</strong></span>
        </button>

        <nav className="primary-nav" aria-label="Main navigation">
          {navigationItems.map((item) => {
            const target = navigationTargets[item];
            return (
              <button
                aria-current={screen === target ? "page" : undefined}
                className={`nav-item${screen === target ? " active" : ""}`}
                key={item}
                onClick={() => setScreen(target)}
                type="button"
              >
                {item}
              </button>
            );
          })}
        </nav>

        <div className="workspace-label">
          <span className="status-dot" />
          Recruiter workspace
        </div>
      </header>

      {screen === "home" ? (
        <main className="dashboard">
          <section className="welcome-card" aria-labelledby="welcome-title">
            <div className="welcome-copy">
              <p className="eyebrow">YOUR RECRUITING WORKSPACE</p>
              <h1 id="welcome-title">Build your team with clarity.</h1>
              <p className="welcome-description">
                A thoughtful home for your hiring workflow. Manage job openings
                and candidate profiles from one place.
              </p>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="orbit orbit-outer" />
              <div className="orbit orbit-inner" />
              <div className="orbit-core">T</div>
              <span className="orbit-dot orbit-dot-one" />
              <span className="orbit-dot orbit-dot-two" />
              <span className="orbit-dot orbit-dot-three" />
            </div>
          </section>

          <section className="section-heading" aria-labelledby="overview-title">
            <div>
              <p className="eyebrow">GETTING STARTED</p>
              <h2 id="overview-title">Your workspace, at a glance</h2>
            </div>
            <span className="setup-badge">Foundation is ready</span>
          </section>

          <section className="feature-grid" aria-label="Platform areas">
            <article className="feature-card">
              <span className="feature-icon icon-jobs" aria-hidden="true">J</span>
              <p className="feature-label">01 / JOBS</p>
              <h3>Job workspace</h3>
              <p>Manage openings and keep role details in one place.</p>
              <button className="text-action" onClick={() => setScreen("jobs")} type="button">
                Open jobs <span aria-hidden="true">→</span>
              </button>
            </article>

            <article className="feature-card">
              <span className="feature-icon icon-candidates" aria-hidden="true">C</span>
              <p className="feature-label">02 / CANDIDATES</p>
              <h3>Candidate profiles</h3>
              <p>Capture candidate details and relevant skills.</p>
              <button className="text-action" onClick={() => setScreen("candidates")} type="button">
                Open candidates <span aria-hidden="true">→</span>
              </button>
            </article>

            <article className="feature-card">
              <span className="feature-icon icon-matching" aria-hidden="true">M</span>
              <p className="feature-label">03 / MATCHING</p>
              <h3>Explainable matching</h3>
              <p>Bring role requirements and talent insights together.</p>
              <button
                className="text-action"
                onClick={() => setScreen("matching")}
                type="button"
              >
                Run a match <span aria-hidden="true">→</span>
              </button>
            </article>
          </section>
        </main>
      ) : (
        <main className="dashboard">
          {screen === "jobs" ? (
            <JobsPage />
          ) : screen === "candidates" ? (
            <CandidatesPage />
          ) : (
            <MatchingPage onNavigate={setScreen} />
          )}
        </main>
      )}

      <footer className="page-footer">
        <span>TalentPilot AI</span>
        <span>Recruiting, made more considered.</span>
      </footer>
    </div>
  );
}

export default App;
