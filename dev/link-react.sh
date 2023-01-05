#!/usr/bin/env bash

if [[ $# -eq 0 ]]
  then
    echo "Please enter as first argument the client project path"
    exit 1;
fi

clientProjectPathNodeModules="$1/node_modules/"

npm link "$clientProjectPathNodeModules"/react
npm link "$clientProjectPathNodeModules"/react-dom
