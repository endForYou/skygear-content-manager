set -ex

cp -r client/build public_html

npm install -g skycli
mkdir -p /home/travis/.skycli
echo $SKYCLI_RC > $HOME/.skycli/skyclirc

skycli deploy
