# jacobisweartogod

A personal static website built with p5.js, hosted at https://jacobisweartogod.com.

## Deployment

Push to `master` — GitHub Actions automatically syncs the repo to S3. CloudFront serves the site over HTTPS. No manual steps needed.

Infrastructure:
- S3 bucket: `jacobisweartogod.com` (us-east-1)
- CloudFront distribution in front for HTTPS
- DNS managed in Route 53
- Deploy workflow: `.github/workflows/deploy.yml`

## Structure

```
/                        # Root page (bouncing nik image + flyswatter)
  index.html
  jistg.js
  images/                # 1512.jpg, nik.png, flyswatter.png
  sounds/                # istg.mp3, song.mp3
  P5js/                  # p5.js library files

firemansam/              # Fullscreen video player
itsraining/              # Raindrop animation with sound
  images/                # julianrain.jpg
  sounds/                # itsraining.mp3, maspeek.mp3
  P5js/
julianscomputer/         # Click/keypress to spawn growing shapes
  P5js/
```

Each sub-page is self-contained with its own assets and P5js copy.

## Adding a new sub-page

1. Create a directory with an `index.html` and a JS file
2. Copy `P5js/` into the sub-page directory if it uses p5
3. Put images in `<subpage>/images/` and sounds in `<subpage>/sounds/`
4. Commit and push — it deploys automatically
