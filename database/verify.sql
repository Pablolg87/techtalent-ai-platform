BEGIN;

DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_job_id UUID := gen_random_uuid();
    test_candidate_id UUID := gen_random_uuid();
BEGIN
    IF to_regclass('public.users') IS NULL
        OR to_regclass('public.jobs') IS NULL
        OR to_regclass('public.candidates') IS NULL
        OR to_regclass('public.applications') IS NULL THEN
        RAISE EXCEPTION 'One or more required tables are missing';
    END IF;

    INSERT INTO users (id, email, full_name, role)
    VALUES (test_user_id, 'db-check-user@example.test', 'Fictional DB Check User', 'recruiter');

    INSERT INTO jobs (id, title, description, created_by)
    VALUES (test_job_id, 'Database Check Role', 'Fictional verification role', test_user_id);

    INSERT INTO candidates (id, full_name, email, skills)
    VALUES (test_candidate_id, 'Fictional DB Check Candidate', 'db-check-candidate@example.test', '["PostgreSQL"]');

    INSERT INTO applications (job_id, candidate_id)
    VALUES (test_job_id, test_candidate_id);

    IF NOT EXISTS (
        SELECT 1
        FROM applications AS application
        JOIN jobs AS job ON job.id = application.job_id
        JOIN users AS creator ON creator.id = job.created_by
        JOIN candidates AS candidate ON candidate.id = application.candidate_id
        WHERE application.job_id = test_job_id
          AND application.candidate_id = test_candidate_id
          AND creator.id = test_user_id
    ) THEN
        RAISE EXCEPTION 'Insert/select or foreign-key relationship verification failed';
    END IF;

    RAISE NOTICE 'Database verification passed: PostgreSQL reachable, tables present, inserts/select and foreign keys work.';
END;
$$;

ROLLBACK;