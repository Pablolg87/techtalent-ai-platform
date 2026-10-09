import { useEffect, useState } from "react";
import { api, ApiError, getErrorMessage, type Candidate, type Job, type MatchingResult } from "../api/client";

interface MatchingPageProps {
  onNavigate: (screen: "jobs" | "candidates") => void;
}

function matchingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.message === "Job not found") {
      return "The selected job is no longer available. Refresh your jobs and try again.";
    }
    if (error.message === "Candidate not found") {
      return "The selected candidate is no longer available. Refresh your candidates and try again.";
    }
    if (error.status === 502 || error.status === 503 || error.status === 504) {
      return error.status === 504
        ? "The AI matching service timed out. Please try again shortly."
        : "The AI matching service is currently unavailable. Please try again shortly.";
    }
    return getErrorMessage(error);
  }
  return getErrorMessage(error);
}

function MatchingPage({ onNavigate }: MatchingPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [result, setResult] = useState<MatchingResult | null>(null);

  async function loadOptions() {
    setLoadingOptions(true);
    setOptionsError("");
    setMatchError("");
    setResult(null);
    try {
      const [availableJobs, availableCandidates] = await Promise.all([
        api.listJobs(),
        api.listCandidates(),
      ]);
      setJobs(availableJobs);
      setCandidates(availableCandidates);
      setSelectedJobId((current) =>
        availableJobs.some((job) => job.id === current) ? current : "",
      );
      setSelectedCandidateId((current) =>
        availableCandidates.some((candidate) => candidate.id === current) ? current : "",
      );
    } catch (error) {
      setOptionsError(getErrorMessage(error));
    } finally {
      setLoadingOptions(false);
    }
  }

  useEffect(() => {
    void loadOptions();
  }, []);

  async function calculateMatch() {
    if (!selectedJobId || !selectedCandidateId) return;
    setCalculating(true);
    setMatchError("");
    setResult(null);
    try {
      const matchResult = await api.calculateMatch({
        job_id: selectedJobId,
        candidate_id: selectedCandidateId,
      });
      setResult(matchResult);
    } catch (error) {
      setMatchError(matchingErrorMessage(error));
    } finally {
      setCalculating(false);
    }
  }

  const hasNoJobs = !loadingOptions && !optionsError && jobs.length === 0;
  const hasNoCandidates = !loadingOptions && !optionsError && candidates.length === 0;

  return (
    <section className="data-page matching-page" aria-labelledby="matching-title">
      <div className="data-page-heading">
        <div>
          <p className="eyebrow">TALENT INSIGHTS</p>
          <h1 id="matching-title">Matching</h1>
          <p className="page-description">
            Compare a candidate with a role using the AI matching service.
          </p>
        </div>
        <span className="setup-badge">AI-powered</span>
      </div>

      <section className="panel matching-selector" aria-labelledby="matching-select-title">
        <div className="panel-heading">
          <p className="eyebrow">NEW ANALYSIS</p>
          <h2 id="matching-select-title">Choose a job and candidate</h2>
        </div>

        {loadingOptions ? (
          <p className="state-message" role="status">Loading jobs and candidates…</p>
        ) : optionsError ? (
          <div className="state-block">
            <p className="notice error-notice" role="alert">
              {optionsError}
            </p>
            <button className="secondary-button" onClick={() => void loadOptions()} type="button">
              Try again
            </button>
          </div>
        ) : hasNoJobs || hasNoCandidates ? (
          <div className="state-block">
            <p className="state-message">
              {hasNoJobs && hasNoCandidates
                ? "Add at least one job and one candidate before calculating a match."
                : hasNoJobs
                  ? "There are no jobs to match yet. Add a job to get started."
                  : "There are no candidates to match yet. Add a candidate to get started."}
            </p>
            <div className="matching-shortcuts">
              {hasNoJobs && (
                <button className="secondary-button" onClick={() => onNavigate("jobs")} type="button">
                  Go to Jobs
                </button>
              )}
              {hasNoCandidates && (
                <button className="secondary-button" onClick={() => onNavigate("candidates")} type="button">
                  Go to Candidates
                </button>
              )}
              <button className="secondary-button" onClick={() => void loadOptions()} type="button">
                Refresh lists
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="matching-fields">
              <label className="matching-field">
                Job
                <select
                  onChange={(event) => {
                    setSelectedJobId(event.target.value);
                    setResult(null);
                    setMatchError("");
                  }}
                  value={selectedJobId}
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </label>
              <label className="matching-field">
                Candidate
                <select
                  onChange={(event) => {
                    setSelectedCandidateId(event.target.value);
                    setResult(null);
                    setMatchError("");
                  }}
                  value={selectedCandidateId}
                >
                  <option value="">Select a candidate</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.full_name} — {candidate.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="primary-button calculate-button"
              disabled={calculating || !selectedJobId || !selectedCandidateId}
              onClick={() => void calculateMatch()}
              type="button"
            >
              {calculating ? "Calculating match…" : "Calculate match"}
            </button>
          </>
        )}
      </section>

      {matchError && <p className="notice error-notice match-feedback" role="alert">{matchError}</p>}

      {calculating && (
        <p className="state-message match-feedback" role="status">
          The AI service is analyzing the selected job and candidate…
        </p>
      )}

      {result && !calculating && (
        <section className="panel match-result" aria-labelledby="match-result-title">
          <div className="match-result-heading">
            <div>
              <p className="eyebrow">MATCH ANALYSIS</p>
              <h2 id="match-result-title">Result</h2>
              <p className="match-pair">
                {jobs.find((job) => job.id === result.job_id)?.title ?? "Selected job"}
                <span aria-hidden="true"> · </span>
                {candidates.find((candidate) => candidate.id === result.candidate_id)?.full_name ?? "Selected candidate"}
              </p>
            </div>
            <div className="score-badge" aria-label={`Match score ${result.score} percent`}>
              <span className="score-value">{result.score}%</span>
              <span className="score-caption">match score</span>
            </div>
          </div>

          <div className="score-track" aria-hidden="true">
            <span className="score-fill" style={{ width: `${result.score}%` }} />
          </div>

          <div className="skills-result-grid">
            <section className="skills-result" aria-labelledby="matched-skills-title">
              <h3 id="matched-skills-title">Matched skills</h3>
              {result.matched_skills.length > 0 ? (
                <div className="skill-list">
                  {result.matched_skills.map((skill) => (
                    <span className="skill-tag matched-skill" key={skill}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="result-empty">No matched skills returned.</p>
              )}
            </section>
            <section className="skills-result" aria-labelledby="missing-skills-title">
              <h3 id="missing-skills-title">Missing skills</h3>
              {result.missing_skills.length > 0 ? (
                <div className="skill-list">
                  {result.missing_skills.map((skill) => (
                    <span className="skill-tag missing-skill" key={skill}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="result-empty">No missing skills returned.</p>
              )}
            </section>
          </div>

          <section className="explanation-block" aria-labelledby="explanation-title">
            <h3 id="explanation-title">Explanation</h3>
            <p>{result.explanation || "No explanation was provided by the matching service."}</p>
          </section>
        </section>
      )}
    </section>
  );
}

export default MatchingPage;
