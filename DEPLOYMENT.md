# Deployment

## GitHub Pages

Brand Launchpad is deployed to GitHub Pages at `https://shopari.github.io/brand-launchpad/`.

### GitHub Actions Workflow

The deploy workflow is stored at `workflow-template/deploy.yml`. To enable automatic GitHub Pages
deployment on push to `main`, move this file to `.github/workflows/deploy.yml`:

```bash
# Requires a GitHub token with `workflow` scope
mkdir -p .github/workflows
cp workflow-template/deploy.yml .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "ci: enable GitHub Pages deployment"
git push
```

This step was not completed automatically because the current PAT lacks `workflow` scope.

### Manual Deployment

```bash
npm run build
# Deploy dist/ to GitHub Pages via repository Settings > Pages
```
