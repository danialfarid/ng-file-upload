echo version: $2
echo message: $1

grunt
git add .
git add -u .
git commit -am "$1"
git pull
git push


API_JSON=$(printf '{"tag_name": "%s","target_commitish": "master","name": "Version %s","body": "%s","draft": false,"prerelease": false}' $2 $2 "$1")

echo commit json: $API_JSON

curl --data "$API_JSON" https://api.github.com/repos/danialfarid/ng2-file-upload/releases?access_token=$3

npm publish
meteor publish
