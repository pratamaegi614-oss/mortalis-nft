#!/bin/bash
# Auto-commit and push script for Mortalis NFT project

cd /workspaces/mortalis-nft

# Check if there are changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "🔄 Detecting changes..."
    
    # Add all changes
    git add .
    
    # Create commit message with timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    COMMIT_MSG="Auto-update: $TIMESTAMP"
    
    # If custom message provided, use it
    if [ ! -z "$1" ]; then
        COMMIT_MSG="$1"
    fi
    
    # Commit changes
    git commit -m "$COMMIT_MSG"
    
    # Push to origin
    echo "🚀 Pushing to GitHub..."
    git push origin devin/1779034901-mortalis-init
    
    echo "✅ Changes committed and pushed successfully!"
    echo "🌐 Vercel will auto-deploy from this branch"
else
    echo "ℹ️  No changes to commit"
fi