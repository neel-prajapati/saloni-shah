# Saloni Shah website

The website is a static React/Vite site. Blog posts are managed separately in
Sanity Studio, so publishing a story does not require changing this site or
rebuilding it.

## Set up the blog

1. Create a Sanity project at [sanity.io/manage](https://www.sanity.io/manage)
   and create a dataset named `production`.
2. In the Sanity project's **API > CORS origins**, allow the exact public
   website origins (for example, `https://example.com` and
   `https://www.example.com`). These are read-only browser requests; do not
   enable credentialed access for the website.
3. In the website root, copy `.env.example` to a new file named `.env` (not
   `.env.example`) and set `VITE_SANITY_PROJECT_ID` to the project ID from
   Sanity. Keep the dataset as `production` unless you created a different one.
4. In the `studio` folder, copy `studio/.env.example` to a new file named
   `studio/.env` and set `SANITY_STUDIO_PROJECT_ID` to the same ID. Use the same
   dataset value as the website. The Studio loads this file when its commands
   run; do not rename or overwrite the example file.
5. Start the editor locally:

   ```sh
   cd studio
   npm install
   npm run dev
   ```

   Sign in with a Sanity account that has access to the project. In Sanity
   project management, invite the author with the Editor role.
6. Deploy the editor once:

   ```sh
   npm run deploy
   ```

   Choose a Studio hostname when prompted and share the resulting
   `*.sanity.studio` URL with the author. The editor can also be hosted at a
   custom domain later.
7. Build the website with its root `.env` values:

   ```sh
   cd ..
   npm install
   npm run build
   ```

   Upload the generated `dist` folder to GoDaddy hosting. If you build through
   a CI service, configure the same `VITE_SANITY_PROJECT_ID` and
   `VITE_SANITY_DATASET` values in its build environment. These values identify
   the public Sanity project and dataset; do not put private API tokens in the
   website. Upload the hidden `.htaccess` file from `dist` as well; it routes
   direct requests such as `/blog/story-slug` back through React Router.

## Publishing a story

The author signs in to the Sanity Studio URL, opens **Blog post**, and creates
a post. Add a title, story, and publication date; the URL slug is generated
from the title and can be edited. A short introduction and cover image are
optional. Publish the document to make it visible on the website. The blog
fetches published posts from Sanity when visitors open it, so new posts appear
without redeploying the GoDaddy-hosted site.

After uploading the site, test a blog post by opening its URL directly and
refreshing the page. If GoDaddy's File Manager hides dotfiles, enable hidden
files and confirm `.htaccess` is present in the hosting web root.

## Local website development

Set the website environment variables as described above, then run these from
the repository root:

```sh
npm install
npm run dev
```
