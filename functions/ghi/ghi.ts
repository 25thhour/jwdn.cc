// Redirect to GitHub gitignore file

const capitalise = (string: String) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export async function onRequest(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  const { pathname } = new URL(request.url);
  const filename = capitalise(pathname.split("/")[2]);
  const githubUrl = `https://raw.githubusercontent.com/github/gitignore/main/${filename}.gitignore`;
  const statusCode = 302;

  return Response.redirect(githubUrl, statusCode);
}
