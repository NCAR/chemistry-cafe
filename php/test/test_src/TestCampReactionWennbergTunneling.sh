#!/bin/bash

# exit on error
set -e
# turn on command echoing
set -v
# make sure the current directory is the one where this script is
cd ${0%/*}

exec_str="php TestCampReactionWennbergTunneling.php"

if ! $exec_str; then
  echo Failure
  exit 1
else
  echo PASS
  exit 0
fi
