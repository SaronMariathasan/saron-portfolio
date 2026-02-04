#!/bin/bash
set -e  

echo "=== Initialising and updating git submodules ==="
git submodule update --init --recursive

echo "=== Installing backend dependencies ==="
cd backend
npm install
cd ..

echo "=== Installing frontend dependencies ==="
cd frontend
npm install
cd ..

echo "Setup complete!"