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

#### Option 1: Via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy website"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository: `DresdenGman/EPSILON-trading-simulator`

3. **Configure Project Settings**:
   - **Root Directory**: `website` (important!)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)
   - Your site will be live at `your-project.vercel.app`

5. **Automatic Deployments**:
   - Every push to `main` branch triggers automatic deployment
   - Preview deployments are created for pull requests

#### Option 2: Via Vercel CLI

```bash
npm i -g vercel
cd website
vercel
```

Follow the prompts to deploy.

#### Important Configuration

Make sure to set the **Root Directory** to `website` in Vercel project settings, since the website is in a subdirectory of the repository.

## Customization

You can customize the website by editing:

- `app/page.tsx` - Main homepage
- `app/download/page.tsx` - Download page
- `app/globals.css` - Global styles
- `app/layout.tsx` - Root layout

## Notes

- The download links in `/download` page are placeholders. Update them with actual download URLs when releases are available.
- You can integrate with GitHub Releases API to automatically fetch latest release information.
