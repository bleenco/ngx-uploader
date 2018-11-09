#!/usr/bin/env bash

if [ $1 ]; then
  /bin/sh -c "$*"
else
  /bin/sh -c "npm run build:lib"
fi
