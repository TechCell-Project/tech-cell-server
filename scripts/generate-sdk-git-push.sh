#!/bin/sh
# ref: https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/
#
# Usage example: /bin/sh ./generate-sdk-git-push.sh "lehuygiang28" "tech-cell-server-sdk" "minor update" main

git_user_id=${1:-"GIT_USER_ID"}
git_repo_id=${2:-"GIT_REPO_ID"}
release_note=${3:-"Minor update"}
branch=${4:-"master"}

# Initialize the local directory as a Git repository
if [ ! -d ".git" ]; then
    git init || { echo "Error: Unable to initialize the Git repository"; exit 1; }
fi

# Sets the new remote if not defined
if [ -z "$(git remote)" ]; then
    if [ -z "$GIT_TOKEN" ]; then
        echo "[INFO] \$GIT_TOKEN (environment variable) is not set. Using the git credential in your environment."
        git remote add origin "https://github.com/${git_user_id}/${git_repo_id}.git" || { echo "Error: Unable to add remote"; exit 1; }
    else
        git remote add origin "https://${git_user_id}:${GIT_TOKEN}@github.com/${git_user_id}/${git_repo_id}.git" || { echo "Error: Unable to add remote"; exit 1; }
    fi
fi

# Fetch the latest changes from the remote repository
git fetch origin $branch

git checkout generated/$branch || git checkout -b generated/$branch || { echo "Error: Unable to create or switch to branch $branch"; exit 1; }

# Adds the files in the local repository and stages them for commit.
git add . || { echo "Error: Unable to add files to the staging area"; exit 1; }

# Commits the tracked changes and prepares them to be pushed to a remote repository.
git commit -a -m "$release_note" || { echo "Error: Unable to commit changes"; exit 1; }

# Switches to the branch to merge in
git checkout $branch || { echo "Error: Unable to switch to branch $branch"; exit 1; }

# Merges the changes from the local branch into the remote branch
git merge generated/$branch -X theirs --allow-unrelated-histories -m "Merge generated/$branch into $branch" || { echo "Error: Unable to merge branch $branch"; exit 1; }

# Pushes the changes in the local repository up to the remote repository
echo "Git pushing to https://github.com/${git_user_id}/${git_repo_id}.git"
git push origin $branch || { echo "Error: Unable to push changes to the remote repository"; exit 1; }