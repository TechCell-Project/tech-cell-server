#!/bin/sh
# ref: https://help.github.com/articles/adding-an-existing-project-to-github-using-the-command-line/
#
# Usage example: /bin/sh ./generate-sdk-git-push.sh "lehuygiang28" "tech-cell-server-sdk" "minor update" main

# Initialize variables with default values
git_user_id="GIT_USER_ID"
git_repo_id="GIT_REPO_ID"
release_note="Minor update"
branch="master"
script_generate_sdk=""
directory_generated_sdk=""

# Parse named arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --git_user_id=*)
      git_user_id="${1#*=}"
      ;;
    --git_repo_id=*)
      git_repo_id="${1#*=}"
      ;;
    --release_note=*)
      release_note="${1#*=}"
      ;;
    --branch=*)
      branch="${1#*=}"
      ;;
    --script_generate_sdk=*)
      script_generate_sdk="${1#*=}"
      ;;
    --directory_generated_sdk=*)
      directory_generated_sdk="${1#*=}"
      ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
done

if [ ! -d "$directory_generated_sdk" ]; then
    echo "Error: $directory_generated_sdk does not exist"
    exit 1
fi

# Change to the directory
cd $directory_generated_sdk || { echo "Error: Unable to change to the directory $directory_generated_sdk"; exit 1; }

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

git pull

git checkout $branch || { echo "Error: Unable to switch to branch $branch"; exit 1; }

rm -rf ./* ./.??* || { echo "Error: Unable to remove files in the current directory"; exit 1; }

if [ -z "$script_generate_sdk" ]; then
    echo "Error: script_generate_sdk is not defined"
    exit 1
fi

$script_generate_sdk || { echo "Error: Unable to generate SDK"; exit 1; }

# Add the generated files
git add . || { echo "Error: Unable to add files to the staging area"; exit 1; }

# Commit the changes
git commit -a -m "$release_note" || { echo "Error: Unable to commit changes"; exit 1; }

# Push the changes
echo "Git pushing to https://github.com/${git_user_id}/${git_repo_id}.git"
git push origin $branch || { echo "Error: Unable to push changes to the remote repository"; exit 1; }
