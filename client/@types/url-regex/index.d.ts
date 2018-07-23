declare module 'url-regex' {
  interface Option {
    exact?: boolean;
    strict?: boolean;
  }

  export default function urlRegex(option?: Option): RegExp;
}
