set -ex

pushd .

cd client

npm install --production
npm run build
rm -rf public_html
mv build public_html

popd

mv client/build public_html
rm -rf client

npm install -g skycli
mkdir -p /home/travis/.skycli
echo $SKYCLI_RC > $HOME/.skycli/skyclirc

skycli deploy
