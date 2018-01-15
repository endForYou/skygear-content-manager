set -ex

cp -r client/example public_html

npm install -g skycli
skycli login --email $SKYCLI_EMAIL --password $SKYCLI_PASSWORD

skycli deploy
