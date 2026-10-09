import { useEffect, useState, type FormEvent } from "react";
import { api, getErrorMessage, type Candidate } from "../api/client";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [skillsText, setSkillsText] = useState("");

  async function loadCandidates() {
    setLoading(true);
    setLoadError("");
    try {
      setCandidates(await api.listCandidates());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCandidates();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const skills = [...new Set(
      skillsText.split(/[,\n]/).map((skill) => skill.trim()).filter(Boolean),
    )];
    const parsedExperience = experience.trim() ? Number(experience) : null;

    if (!trimmedName) {
      setFormError("Enter the candidate’s full name.");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (parsedExperience !== null && (!Number.isFinite(parsedExperience) || parsedExperience < 0)) {
      setFormError("Years of experience must be zero or greater.");
      return;
    }

    setSaving(true);
    try {
      const created = await api.createCandidate({
        full_name: trimmedName,
        email: trimmedEmail,
        location: location.trim() || null,
        years_experience: parsedExperience,
        skills,
      });
      setCandidates((current) => [
        created,
        ...current.filter((candidate) => candidate.id !== created.id),
      ]);
      setFullName("");
      setEmail("");
      setLocation("");
      setExperience("");
      setSkillsText("");
      setSuccess("Candidate created successfully.");
    } catch (error) {
      const message = getErrorMessage(error);
      setFormError(
        message === "A candidate with this email already exists"
          ? "A candidate with this email already exists. Check the email or review the candidate list."
          : message,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="data-page" aria-labelledby="candidates-title">
      <div className="data-page-heading">
        <div>
          <p className="eyebrow">TALENT WORKSPACE</p>
          <h1 id="candidates-title">Candidates</h1>
          <p className="page-description">Keep candidate profiles and skills easy to review.</p>
        </div>
        <span className="setup-badge">
          {candidates.length} {candidates.length === 1 ? "candidate" : "candidates"}
        </span>
      </div>

      <div className="data-layout">
        <section className="panel form-panel" aria-labelledby="create-candidate-title">
          <div className="panel-heading">
            <p className="eyebrow">NEW PROFILE</p>
            <h2 id="create-candidate-title">Add a candidate</h2>
          </div>
          {success && <p className="notice success-notice" role="status">{success}</p>}
          {formError && <p className="notice error-notice" role="alert">{formError}</p>}
          <form className="entry-form" onSubmit={handleSubmit}>
            <label>
              Full name <span className="required-mark">*</span>
              <input
                autoComplete="name"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Taylor Morgan"
                required
                value={fullName}
              />
            </label>
            <label>
              Email <span className="required-mark">*</span>
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <div className="form-row">
              <label>
                Location <span className="optional-label">Optional</span>
                <input
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Remote"
                  value={location}
                />
              </label>
              <label>
                Years of experience <span className="optional-label">Optional</span>
                <input
                  min="0"
                  onChange={(event) => setExperience(event.target.value)}
                  placeholder="e.g. 5"
                  step="any"
                  type="number"
                  value={experience}
                />
              </label>
            </div>
            <label>
              Skills <span className="optional-label">Optional</span>
              <textarea
                onChange={(event) => setSkillsText(event.target.value)}
                placeholder={"TypeScript, React, PostgreSQL"}
                rows={3}
                value={skillsText}
              />
              <span className="field-hint">Separate skills with commas or new lines. Duplicate entries are removed.</span>
            </label>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "Creating…" : "Add candidate"}
            </button>
          </form>
        </section>

        <section className="panel records-panel" aria-labelledby="candidates-list-title">
          <div className="panel-heading list-heading">
            <div>
              <p className="eyebrow">YOUR TALENT POOL</p>
              <h2 id="candidates-list-title">Candidate profiles</h2>
            </div>
            <button className="secondary-button" onClick={() => void loadCandidates()} type="button">
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="state-message" role="status">Loading candidates…</p>
          ) : loadError ? (
            <div className="state-block">
              <p className="notice error-notice" role="alert">{loadError}</p>
              <button className="secondary-button" onClick={() => void loadCandidates()} type="button">
                Try again
              </button>
            </div>
          ) : candidates.length === 0 ? (
            <p className="state-message">No candidates yet. Add a profile to see it here.</p>
          ) : (
            <ul className="record-list">
              {candidates.map((candidate) => (
                <li className="record-card" key={candidate.id}>
                  <div className="record-title-row">
                    <h3>{candidate.full_name}</h3>
                    {candidate.years_experience !== null && (
                      <span className="record-status">
                        {candidate.years_experience} yrs experience
                      </span>
                    )}
                  </div>
                  <a className="record-email" href={`mailto:${candidate.email}`}>
                    {candidate.email}
                  </a>
                  <div className="record-meta">
                    <span>{candidate.location || "Location not specified"}</span>
                    <span>Added {formatDate(candidate.created_at)}</span>
                  </div>
                  <div className="skill-list" aria-label="Skills">
                    {candidate.skills.length > 0 ? candidate.skills.map((skill) => (
                      <span className="skill-tag" key={skill}>{skill}</span>
                    )) : <span className="field-hint">No skills listed</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}

export default CandidatesPage;
