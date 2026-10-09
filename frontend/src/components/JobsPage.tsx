import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError, getErrorMessage, type Job } from "../api/client";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [creatorId, setCreatorId] = useState("");

  async function loadJobs() {
    setLoading(true);
    setLoadError("");
    try {
      setJobs(await api.listJobs());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCreatorId = creatorId.trim();
    if (!trimmedTitle) {
      setFormError("Enter a job title.");
      return;
    }
    if (trimmedDescription.length < 20) {
      setFormError("The description must contain at least 20 characters.");
      return;
    }
    if (!uuidPattern.test(trimmedCreatorId)) {
      setFormError("Enter a valid UUID for the existing job creator.");
      return;
    }

    setSaving(true);
    try {
      const created = await api.createJob({
        title: trimmedTitle,
        description: trimmedDescription,
        location: location.trim() || null,
        created_by: trimmedCreatorId,
      });
      setJobs((current) => [created, ...current.filter((job) => job.id !== created.id)]);
      setTitle("");
      setDescription("");
      setLocation("");
      setCreatorId("");
      setSuccess("Job created successfully.");
    } catch (error) {
      if (error instanceof ApiError && error.message === "Invalid job creator") {
        setFormError(
          "That UUID does not match an existing user. Enter an existing user ID; user registration will be available in Sprint 7.",
        );
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="data-page" aria-labelledby="jobs-title">
      <div className="data-page-heading">
        <div>
          <p className="eyebrow">HIRING WORKSPACE</p>
          <h1 id="jobs-title">Jobs</h1>
          <p className="page-description">Create and review your open roles.</p>
        </div>
        <span className="setup-badge">{jobs.length} {jobs.length === 1 ? "job" : "jobs"}</span>
      </div>

      <div className="data-layout">
        <section className="panel form-panel" aria-labelledby="create-job-title">
          <div className="panel-heading">
            <p className="eyebrow">NEW OPENING</p>
            <h2 id="create-job-title">Create a job</h2>
          </div>
          {success && <p className="notice success-notice" role="status">{success}</p>}
          {formError && <p className="notice error-notice" role="alert">{formError}</p>}
          <form className="entry-form" onSubmit={handleSubmit}>
            <label>
              Job title <span className="required-mark">*</span>
              <input
                autoComplete="off"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
                value={title}
              />
            </label>
            <label>
              Description <span className="required-mark">*</span>
              <textarea
                minLength={20}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the role and its key responsibilities (at least 20 characters)."
                required
                rows={5}
                value={description}
              />
              <span className="field-hint">At least 20 characters.</span>
            </label>
            <label>
              Location <span className="optional-label">Optional</span>
              <input
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Remote"
                value={location}
              />
            </label>
            <label>
              Temporary creator UUID <span className="required-mark">*</span>
              <input
                autoComplete="off"
                onChange={(event) => setCreatorId(event.target.value)}
                placeholder="Existing user UUID"
                required
                value={creatorId}
              />
              <span className="field-hint">
                An existing user ID is required by the database. User registration
                is not available until Sprint 7.
              </span>
            </label>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "Creating…" : "Create job"}
            </button>
          </form>
        </section>

        <section className="panel records-panel" aria-labelledby="jobs-list-title">
          <div className="panel-heading list-heading">
            <div>
              <p className="eyebrow">YOUR PIPELINE</p>
              <h2 id="jobs-list-title">Job openings</h2>
            </div>
            <button className="secondary-button" onClick={() => void loadJobs()} type="button">
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="state-message" role="status">Loading jobs…</p>
          ) : loadError ? (
            <div className="state-block">
              <p className="notice error-notice" role="alert">{loadError}</p>
              <button className="secondary-button" onClick={() => void loadJobs()} type="button">
                Try again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <p className="state-message">No jobs yet. Create a job to see it here.</p>
          ) : (
            <ul className="record-list">
              {jobs.map((job) => (
                <li className="record-card" key={job.id}>
                  <div className="record-title-row">
                    <h3>{job.title}</h3>
                    <span className="record-status">{job.status}</span>
                  </div>
                  <p className="record-description">{job.description}</p>
                  <div className="record-meta">
                    <span>{job.location || "Location not specified"}</span>
                    <span>Added {formatDate(job.created_at)}</span>
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

export default JobsPage;
