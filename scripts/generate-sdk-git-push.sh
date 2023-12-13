#!/bin/sh
# ref: https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/
#
# Usage example: /bin/sh ./generate-sdk-git-push.sh "lehuygiang28" "tech-cell-server-sdk" "minor update" main

git_user_id=$1
git_repo_id=$2
release_note=$3
branch=$4

# Set default values if not provided
git_user_id=${git_user_id:-"GIT_USER_ID"}
git_repo_id=${git_repo_id:-"GIT_REPO_ID"}
release_note=${release_note:-"Minor update"}
branch=${branch:-"master"}

# Initialize the local directory as a Git repository
git init

# Sets the new remote
git_remote=`git remote`
if [ "$git_remote" = "" ]; then # git remote not defined
    if [ "$GIT_TOKEN" = "" ]; then
        echo "[INFO] \$GIT_TOKEN (environment variable) is not set. Using the git credential in your environment."
        git remote add origin https://github.com/${git_user_id}/${git_repo_id}.git
    else
        git remote add origin https://${git_user_id}:${GIT_TOKEN}@github.com/${git_user_id}/${git_repo_id}.git
    fi
fi

git add .

# Stash all local changes
git stash push -m "local changes"

# Fetch the latest changes from the remote repository
git fetch origin $branch

# Check if there are any untracked files
untracked_files=$(git ls-files --others --exclude-standard)
if [ -n "$untracked_files" ]; then
    # Stash or remove the untracked files
    git stash push -u
fi

# Checkout the remote branch
git checkout -b $branch origin/$branch

# Pull the latest changes from the remote repository, rebasing your changes on top of them
git pull --rebase origin $branch

# Apply the stash and keep it in case of conflicts
git stash apply

# Check if there are any stash entries
stash_entries=$(git stash list)
if [ -n "$stash_entries" ]; then
    git stash branch temp-branch
    git merge temp-branch --strategy-option theirs
    git branch -d temp-branch
fi

git add .
git commit -m "$release_note"

# Remove the applied stash
git stash drop

# Pushes the changes in the local repository up to the remote repository
echo "Git pushing to https://github.com/${git_user_id}/${git_repo_id}.git"
git push origin $branch