set -ex

rm -rf 
npm install --production
npm run build
rm -rf public_html
mv build public_html

npm install -g skycli
mkdir -p /home/travis/.skycli
echo $SKYCLI_RC > $HOME/.skycli/skyclirc
rm -rf node_modules
skycli deploy
