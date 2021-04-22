#!/bin/bash

# exit on error
set -e
# turn on command echoing
set -v
# make sure the current directory is the one where this script is
cd ${0%/*}
# make the output directory if it doesn't exist
mkdir -p out

exec_str="./calculate_custom_rate_constants"
exec_str2="php TestCustomReaction.php"

if ! $exec_str; then
  echo Failure
  exit 1
else
  if ! $exec_str2; then
    echo Failure
    exit 1
  else
    md5sum CAM/mo_usrrxt.F90 > md5_checksum_mo_usrrxt
    echo PASS
    exit 0
  fi
fi
