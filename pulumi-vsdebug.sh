#!/usr/bin/env bash
function initVars() {
  export AWS_REGION=${AWS_REGION:-us-east-1}
  export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd || exit 255)"
  # export -n NODE_OPTIONS
  export PULUMI_DEBUG_PROMISE_LEAKS=true
  export PLMI_TRC_ARGS='--tracing=file:./pulumi-debug.trace'
  export PLMI_LOG_ARGS="--logtostderr -v=9 2> pulumi-debug.log"
  export TF_LOG=TRACE
  echo "BEGINOFPULUMUTASK"
}
function checkDeps() {
  local binDeps
  binDeps=(
    pulumi
    tsc
    npm
  )
  for bin in "${binDeps[@]}"; do
    command -v "${bin}" &>/dev/null || {
      echo >&2 "Required binary ${bin} not found exiting. binDeps: ${binDeps[*]}"
      exit 254
    }
  done
}
function plmLogin () {
  pulumi login --cloud-url s3://whistle-pulumi-state
  echo "Building tsc files"
  tsc --sourceMap --noImplicitAny false
}
function chngToStackPath () {
  cd "${SCRIPT_DIR}/${stack_path}" || exit 255
}
function plmStackSelect () {
  pulumi stack select $stack_name
}
function plmPreview () {
  pulumi preview --diff --color always --logtostderr -v=9 2> pulumi-debug.log
}

function main() {
  initVars
  checkDeps
  plmLogin
  stack_name="${1}"
  stack_path="${2}"
  [[ -z $stack_name ]] && exit 1
  [[ -z $stack_path ]] && exit 1
  chngToStackPath
  plmStackSelect "$stack_name" "$stack_path"
  plmPreview "$stack_name" "$stack_path"
  echo "ENDOFPULUMITASK"
}
main "$@"
