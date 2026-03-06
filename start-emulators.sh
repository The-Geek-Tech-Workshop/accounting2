#!/bin/bash
cd ui && npm run build:emulation && cd ..
firebase emulators:start --import test-data