#!/bin/sh

git_user_id=$1
git_repo_id=$2
release_note=$3
branch=$4

git_user_id=${git_user_id:-"GIT_USER_ID"}
git_repo_id=${git_repo_id:-"GIT_REPO_ID"}
release_note=${release_note:-"Minor update"}
branch=${branch:-"master"}

git init

git_remote=`git remote`
if [ "$git_remote" = "" ]; then
    if [ "$GIT_TOKEN" = "" ]; then
        echo "[INFO] \$GIT_TOKEN (environment variable) is not set. Using the git credential in your environment."
        git remote add origin https://github.com/${git_user_id}/${git_repo_id}.git
    else
        git remote add origin https://${git_user_id}:${GIT_TOKEN}@github.com/${git_user_id}/${git_repo_id}.git
    fi
fi

git add .

# Stash all local changes
git stash save --include-untracked "local changes"

# Fetch the latest changes from the remote repository
git fetch origin $branch

# Checkout the remote branch
git checkout -b $branch origin/$branch

# Pull the latest changes from the remote repository, rebasing your changes on top of them
git pull --rebase origin $branch

# Apply the stash and keep it in case of conflicts
git stash apply && git stash drop

git add .
git commit -m "$release_note"

# Pushes the changes in the local repository up to the remote repository
echo "Git pushing to https://github.com/${git_user_id}/${git_repo_id}.git"
git push -u origin $branch