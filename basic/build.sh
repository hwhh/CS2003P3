#!/bin/bash

if [ ! -x node_modules ]
then
  echo "Installing Dependencies"
  npm link express validator mocha chai casperjs sinon body-parser
fi

#source /cs/studres/CS2003/node/bin/cs2003.sh
npm install validator
npm install body-parser
npm install express
npm install lodash
npm install npid
npm install chai
npm install basic-auth
npm install mongoose
npm install express-session
npm install sinon
npm install sinon-chai
npm install supertest
npm install superagent
npm install should
npm install async
npm install passport
mocha test/unit/*.js
