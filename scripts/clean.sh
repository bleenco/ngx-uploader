#!/bin/bash

find . -name "*.js" -type f -not -path "./node_modules/*" -delete
find . -name "*.js.map" -type f -not -path "./node_modules/*" -delete
find . -name "*.d.ts" -type f -not -path "./node_modules/*" -delete
