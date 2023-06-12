import { Options } from "$fresh/plugins/twind.ts";
import * as colors from "twind/colors";

function hash(s: string) {
  let n = 1000
  for (const c of s) {
    n ^= n * c.charCodeAt(0)
  }
  return "github-falentio-" + (n >>> 0).toString(36)
}

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      colors: {
        sky: colors.sky,
      }
    }
  },
  hash
} as Options;
