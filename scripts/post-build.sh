#!/bin/bash
# Post-build script to fix manifest.webmanifest path for GitHub Pages
# Next.js generates manifest.webmanifest at root, but with basePath it needs to be in the basePath directory

set -e

OUT_DIR="out"
BASE_PATH="${GITHUB_REPOSITORY_NAME:-}"

if [ -z "$BASE_PATH" ]; then
  echo "No GITHUB_REPOSITORY_NAME set, skipping manifest copy"
  exit 0
fi

BASE_PATH_DIR="${OUT_DIR}/${BASE_PATH}"

# Create basePath directory if it doesn't exist
mkdir -p "${BASE_PATH_DIR}"

# Copy manifest.webmanifest to basePath directory
if [ -f "${OUT_DIR}/manifest.webmanifest" ]; then
  echo "Copying manifest.webmanifest to ${BASE_PATH_DIR}/"
  cp "${OUT_DIR}/manifest.webmanifest" "${BASE_PATH_DIR}/manifest.webmanifest"
  
  # Also copy icons to basePath directory
  if [ -f "${OUT_DIR}/icon-192x192.png" ]; then
    cp "${OUT_DIR}/icon-192x192.png" "${BASE_PATH_DIR}/icon-192x192.png"
  fi
  if [ -f "${OUT_DIR}/icon-512x512.png" ]; then
    cp "${OUT_DIR}/icon-512x512.png" "${BASE_PATH_DIR}/icon-512x512.png"
  fi
  if [ -f "${OUT_DIR}/favicon.ico" ]; then
    cp "${OUT_DIR}/favicon.ico" "${BASE_PATH_DIR}/favicon.ico"
  fi
  if [ -f "${OUT_DIR}/apple-icon.png" ]; then
    cp "${OUT_DIR}/apple-icon.png" "${BASE_PATH_DIR}/apple-icon.png"
  fi
  
  echo "Manifest and icons copied successfully"
else
  echo "Warning: manifest.webmanifest not found in ${OUT_DIR}/"
fi

