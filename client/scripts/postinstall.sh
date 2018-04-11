#!/bin/sh

echo "Begin npm postinstall"

cat node_modules/tinymce/tinymce.min.js > public/tinymce/tinymce.min.js
cat node_modules/tinymce/themes/modern/theme.min.js >> public/tinymce/tinymce.min.js
cat node_modules/tinymce/plugins/*/plugin.min.js >> public/tinymce/tinymce.min.js
cp -r node_modules/tinymce/skins public/tinymce

echo "End npm postinstall"
