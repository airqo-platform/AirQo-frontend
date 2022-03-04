#!/bin/bash
set -e
export PGPASSWORD=password;
psql -v ON_ERROR_STOP=1 --username user --dbname database <<-EOSQL