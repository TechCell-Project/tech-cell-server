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

# Fetch the latest changes from the remote repository
git fetch origin $branch

# Checkout the remote branch
git checkout -b $branch origin/$branch

# Adds the files in the local repository and stages them for commit.
git add .

# Commits the tracked changes and prepares them to be pushed to a remote repository.
git commit -m "$release_note"

# Pushes the changes in the local repository up to the remote repository
echo "Git pushing to https://github.com/${git_user_id}/${git_repo_id}.git"
git push origin $branch