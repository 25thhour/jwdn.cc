# jwdn.cc

Personal short url collection…may evolve into a full blown short url service at some point.

## Examples

- [jwdn.cc/dot](https://github.com/25thhour/dotfiles) links to my dotfiles repo.
- [jwdn.cc/tw](https://twitter.com/25thhour) links to my Twitter profile.

## Functions

:warning: the following assumes [Wrangler 2](https://github.com/cloudflare/wrangler2) has been installed globally.

Cloudflare Workers live in the `./functions` directory and are set to be ignored by 11ty in the `.eleventyignore` file.

To test a function run `npx wrangler pages dev functions`.

---

Bootstrapped with Eleventy and deployed on [Cloudflare Pages](https://pages.cloudflare.com) with redirects managed via a [`_redirects` file](https://developers.cloudflare.com/pages/platform/redirects).
