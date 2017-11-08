set -ex

cd client

npm install --production
npm run build

cd ..

mv client/build public_html
rm -rf client

npm install -g skycli
mkdir -p /home/travis/.skycli
echo $SKYCLI_RC > $HOME/.skycli/skyclirc

skycli deploy
