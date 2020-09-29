#!/bin/bash

IFS=$'\n' read -d '' -r -a arr <<< "$CI_COMMIT_MESSAGE"

# for index in "${!arr[@]}"
# do
#     echo "$index ${arr[index]}"
# done

DATA="\`${CI_PROJECT_NAME}\`: ${arr[1]}"
JSON="{\"content\": \"${DATA}\"}"
echo ${TWIST_API_URL}
echo ${JSON}

curl -X POST -H 'Content-type: application/json' --data "${JSON}" "${TWIST_API_URL}"