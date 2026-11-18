Web application to track chemical mechanisms, reactions, and molecules.
Users create branches (collections of reactions) and tags (snapshots of mechanisms).
Users add new reactions and assign them to branches.
Users download tagged branches targeted to both kpp and cesm's chemistry preprocessor.

## Run locally with Docker

The `docker` folder holds a copy of the `chem3` database. The copy does not
include the real user accounts.

1. Run `docker compose up --build`.
2. Open http://localhost:8090/login/login.php.
3. Log in with the username `dev` and the password `dev`.

The database loads only when the `chem3-data` volume is empty. To load it
again, run `docker compose down -v`.
