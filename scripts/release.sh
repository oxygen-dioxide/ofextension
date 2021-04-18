#!/bin/bash
while [[ "$#" > 0 ]]; do case $1 in
    -r|--release) release="$2"; shift;;
    -b|--branch) branch="$2"; shift;;
    *) echo "Unknow parameter passed: $1"; exit 1;; 
esac; shift; done

# Default as patch, the argument major, minor, or patch
if [ -z "$release" ]; then
    release="patch";
fi

# Default release branch is master
if [ -z "$branch" ]; then
    branch="master";
fi

echo "Branch is $branch"
echo "Release as $release"

# Tag prefix
prefix="v"
git pull origin $branch
echo "Current pull origin $branch."

# Generate version number and tag
# -r, --release-as: Specify the release type manually (like npm version <major|minor|patch>) 
# -t, --tag-prefix: Set a custom prefix for the git tag to be created
# -i, --infile    : Read the CHANGELOG from this file
standard-version -r $release --tag-prefix $prefix --infile CHANGELOG.md
git push --follow-tags origin master
echo "Release finished"