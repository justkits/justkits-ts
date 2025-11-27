#!/bin/bash

# GitHub Actions Quality Check Results Script
# Usage: check-quality-results.sh <prettier_outcome> <lint_outcome> <typecheck_outcome> <audit_outcome>

set -e

PRETTIER_OUTCOME=$1
LINT_OUTCOME=$2
TYPECHECK_OUTCOME=$3
AUDIT_OUTCOME=$4

echo "## Quality Check Results" >> $GITHUB_STEP_SUMMARY
echo "" >> $GITHUB_STEP_SUMMARY

FAILED=0

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

# Check TypeScript
if [ "$TYPECHECK_OUTCOME" != "success" ]; then
  echo "❌ Type check failed" >> $GITHUB_STEP_SUMMARY
  FAILED=1
else
  echo "✅ Type check passed" >> $GITHUB_STEP_SUMMARY
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