#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting GitHub Pages deployment..."

# 1. Build the Vue.js application
echo "Building Vue.js application..."
npm run build

# 2. Navigate into the build output directory
echo "Navigating into dist directory..."
cd dist

# 3. Initialize a new Git repository in dist, add files, and commit
echo "Initializing git repository in dist and committing files..."
git init
git add -A
git commit -m "Deploy to GitHub Pages"

# 4. Force push to the gh-pages branch
# Replace <YOUR_USERNAME> and <YOUR_REPOSITORY> with your actual GitHub username and repository name
# Example: git push -f https://github.com/your-username/your-repo-name.git master:gh-pages
# It's generally better to let the GitHub Action handle the push to avoid exposing tokens here.
# For local testing, you might need to specify the remote.
echo "Force pushing to gh-pages branch..."
git push -f origin master:gh-pages

echo "Deployment to GitHub Pages complete!"

# Clean up
cd ..
rm -rf dist

exit 0
