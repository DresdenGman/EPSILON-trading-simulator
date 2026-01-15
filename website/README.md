# Stock Trading Simulator Website

This is the website for the Stock Trading Simulator project, built with Next.js.

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To build the website for production:

```bash
npm run build
npm start
```

## Deployment

This website can be deployed to various platforms:

- **Vercel**: Recommended for Next.js projects
- **Netlify**: Also supports Next.js
- **GitHub Pages**: Requires static export
- **Docker**: Use the Dockerfile (if provided)

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm i -g vercel
vercel
```

## Customization

You can customize the website by editing:

- `app/page.tsx` - Main homepage
- `app/download/page.tsx` - Download page
- `app/globals.css` - Global styles
- `app/layout.tsx` - Root layout

## Notes

- The download links in `/download` page are placeholders. Update them with actual download URLs when releases are available.
- You can integrate with GitHub Releases API to automatically fetch latest release information.
