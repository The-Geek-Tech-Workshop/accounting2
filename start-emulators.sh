#!/bin/bash
cd functions && npm run build && rm -rf ./isolate && npm exec isolate && cp .env* ./isolate/ && cd ..
cd ui && npm run build:emulation && cd ..
firebase emulators:start --import test-data