#!/bin/bash

# Check if a commit message was provided
if [ -z "$1" ]; then
    echo "Error: Please provide a commit message"
    echo "Usage: ./patch.sh \"Your commit message\""
    exit 1
fi

# Store the commit message
COMMIT_MESSAGE="$1"

# Stage all changes
git add .

# Bump version without git operations
npm version patch --no-git-tag-version

# Stage the package.json change
git add package.json

# Commit all changes with the provided message
git commit -m "$COMMIT_MESSAGE"

# Create a git tag for the new version
git tag -a v$(node -p "require('./package.json').version") -m "v$(node -p "require('./package.json').version")"

# Push both the commit and the tag
git push && git push --tags

npm run format
npm run build
npm publish --access public

echo "Successfully bumped version and pushed changes"