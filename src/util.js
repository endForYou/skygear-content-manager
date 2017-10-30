// See https://stackoverflow.com/a/14706877
export function isObject(o) {
  return o === Object(o);
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

export function humanize(str) {
  return capitalize(str.replace(/_/g, ' '));
}
