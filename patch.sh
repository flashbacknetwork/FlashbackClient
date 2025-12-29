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

# Attempt to publish
if npm publish --access public; then
    echo "Successfully bumped version and pushed changes"
else
    echo ""
    echo "❌ Publishing failed!"
    echo ""
    echo "If you see a 403 error about 2FA, you need to either:"
    echo "  1. Enable 2FA on your npm account:"
    echo "     - Visit https://www.npmjs.com/settings/YOUR_USERNAME/tokens"
    echo "     - Enable 2FA authentication"
    echo ""
    echo "  2. OR create a granular access token with 'bypass 2fa' enabled:"
    echo "     - Visit https://www.npmjs.com/settings/YOUR_USERNAME/tokens"
    echo "     - Create a new token with 'Automation' or 'Publish' permissions"
    echo "     - Make sure 'bypass 2fa' is enabled"
    echo "     - Then run: npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN"
    echo ""
    exit 1
fi