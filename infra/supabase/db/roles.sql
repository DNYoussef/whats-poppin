-- Upstream self-hosted/v0.8.0 roles with separate Auth and REST passwords.
\set pgpass `echo "$POSTGRES_PASSWORD"`

\set restpass `echo "$REST_DB_PASSWORD"`
\set authpass `echo "$AUTH_DB_PASSWORD"`
ALTER USER authenticator WITH PASSWORD :'restpass';
ALTER USER pgbouncer WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH PASSWORD :'authpass';
ALTER USER supabase_functions_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH PASSWORD :'pgpass';
