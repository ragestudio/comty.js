#!/usr/bin/env sh
set -e

rm -rf dist

tsc
tsc-alias --resolve-full-paths
