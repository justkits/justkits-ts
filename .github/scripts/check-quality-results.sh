#!/bin/bash

# GitHub Actions Quality Check Results Script
# Usage: check-quality-results.sh <dependency_review_outcome> <prettier_outcome> <lint_outcome> <audit_outcome>

set -e

DEPENDENCY_REVIEW_OUTCOME=$1
PRETTIER_OUTCOME=$2
LINT_OUTCOME=$3
AUDIT_OUTCOME=$4

echo "## Quality Check Results" >> $GITHUB_STEP_SUMMARY
echo "" >> $GITHUB_STEP_SUMMARY

FAILED=0

# Check Dependency Review (only runs on PRs)
if [ "$DEPENDENCY_REVIEW_OUTCOME" = "skipped" ]; then
  echo "⏭️  Dependency review skipped (not a PR)" >> $GITHUB_STEP_SUMMARY
elif [ "$DEPENDENCY_REVIEW_OUTCOME" != "success" ]; then
  echo "❌ Dependency review failed" >> $GITHUB_STEP_SUMMARY
  FAILED=1
else
  echo "✅ Dependency review passed" >> $GITHUB_STEP_SUMMARY
fi

# Check Prettier
if [ "$PRETTIER_OUTCOME" != "success" ]; then
  echo "❌ Formatting check failed" >> $GITHUB_STEP_SUMMARY
  FAILED=1
else
  echo "✅ Formatting check passed" >> $GITHUB_STEP_SUMMARY
fi

# Check Lint
if [ "$LINT_OUTCOME" != "success" ]; then
  echo "❌ Lint check failed" >> $GITHUB_STEP_SUMMARY
  FAILED=1
else
  echo "✅ Lint check passed" >> $GITHUB_STEP_SUMMARY
fi

# Check Security Audit
if [ "$AUDIT_OUTCOME" != "success" ]; then
  echo "❌ Security audit failed" >> $GITHUB_STEP_SUMMARY
  FAILED=1
else
  echo "✅ Security audit passed" >> $GITHUB_STEP_SUMMARY
fi

echo "" >> $GITHUB_STEP_SUMMARY

# Exit with appropriate status
if [ $FAILED -eq 1 ]; then
  echo "❌ **Quality checks failed. Please fix the issues above.**" >> $GITHUB_STEP_SUMMARY
  exit 1
else
  echo "✅ **All quality checks passed!**" >> $GITHUB_STEP_SUMMARY
  exit 0
fi