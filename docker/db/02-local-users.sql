-- The bundled dump does not include the rows of the users table.
-- The original rows hold real names and password hashes.
--
-- These placeholder rows keep the original user ids, because comments
-- and log rows refer to them with an INNER JOIN. Nobody can log in with
-- a placeholder row, because the password is NULL.
INSERT INTO public.users (id, firstname, lastname, password, username, initials, edit)
SELECT id, 'User', id::text, NULL, 'user' || id, 'U' || id, 0
FROM unnest(ARRAY[19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]) AS id;

-- Local login: username "dev", password "dev". This user can edit.
INSERT INTO public.users (id, firstname, lastname, password, username, initials, edit)
VALUES (1, 'Local', 'Developer', md5('dev'), 'dev', 'DEV', 1);
