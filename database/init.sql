CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE CHECK (btrim(email) <> ''),
    full_name TEXT NOT NULL CHECK (btrim(full_name) <> ''),
    role TEXT NOT NULL CHECK (btrim(role) <> ''),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (btrim(title) <> ''),
    description TEXT NOT NULL CHECK (btrim(description) <> ''),
    location TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (btrim(status) <> ''),
    created_by UUID NOT NULL REFERENCES users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL CHECK (btrim(full_name) <> ''),
    email TEXT NOT NULL UNIQUE CHECK (btrim(email) <> ''),
    location TEXT,
    years_experience NUMERIC(5, 2) CHECK (years_experience >= 0),
    skills JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(skills) = 'array'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs (id),
    candidate_id UUID NOT NULL REFERENCES candidates (id),
    status TEXT NOT NULL DEFAULT 'applied' CHECK (btrim(status) <> ''),
    matching_score NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT applications_job_candidate_unique UNIQUE (job_id, candidate_id)
);

CREATE INDEX jobs_created_by_idx ON jobs (created_by);
CREATE INDEX jobs_status_idx ON jobs (status);
CREATE INDEX applications_job_id_idx ON applications (job_id);
CREATE INDEX applications_candidate_id_idx ON applications (candidate_id);

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER jobs_set_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER candidates_set_updated_at
BEFORE UPDATE ON candidates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER applications_set_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();