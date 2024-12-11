#!/bin/sh

rsync -aq -u --remove-source-files common/shims-module.d.ts common/shims-vue.d.ts common/tsconfig.json src/app
rsync -aq -u --remove-source-files common/. src

rsync -aq .eslintrc.js .eslintignore .prettierrc.js .prettierignore tsconfig.json .editorconfig src

sed -i 's/"src\//".\//' src/tsconfig.json

rsync -aHAIxvEWS --delete --numeric-ids --inplace --exclude='.cache' --exclude='.bin' node_modules/. src/node_modules/

tail -f /dev/null  # keep container running
