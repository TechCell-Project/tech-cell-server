#!/bin/sh
# ref: https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/
#
# Usage example: /bin/sh ./generate-sdk-git-push.sh "lehuygiang28" "tech-cell-server-sdk" "minor update" main

git_user_id=$1
git_repo_id=$2
release_note=$3
branch=$4

if [ "$git_user_id" = "" ]; then
    git_user_id="GIT_USER_ID"
    echo "[INFO] No command line input provided. Set \$git_user_id to $git_user_id"
fi

if [ "$git_repo_id" = "" ]; then
    git_repo_id="GIT_REPO_ID"
    echo "[INFO] No command line input provided. Set \$git_repo_id to $git_repo_id"
fi

if [ "$release_note" = "" ]; then
    release_note="Minor update"
    echo "[INFO] No command line input provided. Set \$release_note to $release_note"
fi

if [ "$branch" = "" ]; then
    branch="master"
    echo "[INFO] No command line input provided. Set \$branch to $branch"
fi

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

# Fetch the latest changes from the remote repository
git fetch origin

# Rebase the local changes on top of the changes from the remote repository
git rebase origin/$branch

# Adds the files in the local repository and stages them for commit.
git add .

# Commits the tracked changes and prepares them to be pushed to a remote repository.
git commit -m "$release_note"

# Pushes (Forces) the changes in the local repository up to the remote repository
echo "Git pushing to https://github.com/${git_user_id}/${git_repo_id}.git"
git push -f origin $branch 2>&1 | grep -v 'To https'