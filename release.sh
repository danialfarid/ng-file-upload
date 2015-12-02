echo version: $2
echo message: $1

grunt
git add .
git add -u .
git commit -am "$1"
git pull
git push
cd ../angular-file-upload-shim-bower
git add .
git add -u .
git commit -am "$2"
git pull
git push
cd ../angular-file-upload-bower
git add .
git add -u .
git commit -am "$2"
git pull
git push 


API_JSON=$(printf '{"tag_name": "%s","target_commitish": "master","name": "Version %s","body": "%s","draft": false,"prerelease": false}' $2 $2 "$1")

echo commit json: $API_JSON

curl --data "$API_JSON" https://api.github.com/repos/danialfarid/ng-file-upload/releases?access_token=$3

curl --data "$API_JSON" https://api.github.com/repos/danialfarid/ng-file-upload-shim-bower/releases?access_token=$3

curl --data "$API_JSON" https://api.github.com/repos/danialfarid/ng-file-upload-bower/releases?access_token=$3

cd ../ng-file-upload
npm publish

cd ../angular-file-upload-bower
meteor publish

cd ../ng-file-upload
