declare module 'credit-card-regex' {
  interface Option {
    exact?: boolean;
  }
  export default function creditCardRegex(option?: Option): RegExp;
}
