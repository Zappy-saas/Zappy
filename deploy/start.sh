#!/bin/sh
set -eu
node deploy/runtime-config.mjs
exec node server.js
