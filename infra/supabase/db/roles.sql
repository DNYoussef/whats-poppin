-- Only the deployed core roles need login passwords.
SET log_statement = 'none';
\set restpass `echo "$REST_DB_PASSWORD"`
\set authpass `echo "$AUTH_DB_PASSWORD"`
ALTER USER authenticator WITH PASSWORD :'restpass';
ALTER USER supabase_auth_admin WITH PASSWORD :'authpass';
