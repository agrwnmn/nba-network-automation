# NBA Draft Map Assets

This directory contains images for the NBA Draft Map website.

## Directory Structure

```
assets/
├── img/
│   ├── teams/        # NBA team logos (30x30 PNG files)
│   │   ├── hawks.png
│   │   ├── wizards.png
│   │   ├── rockets.png
│   │   └── ... (other team logos)
│   └── players/      # Player profile photos (60x60 JPG files)
│       ├── risacher.jpg
│       ├── sarr.jpg
│       ├── sheppard.jpg
│       └── ... (other player photos)
└── README.md
```

## Placeholder Images

The website is configured to use placeholder images if actual images are not found:
- Player photos: Falls back to https://via.placeholder.com/60
- Team logos: Falls back to https://via.placeholder.com/30

## Adding Real Images

To add real images:

1. **Team Logos**: 
   - Size: 30x30 pixels
   - Format: PNG with transparent background
   - Naming: `teamname.png` (lowercase, no spaces)

2. **Player Photos**:
   - Size: 60x60 pixels (square, cropped)
   - Format: JPG
   - Naming: `lastname.jpg` (lowercase)

## Image Sources

For demo purposes, you can get images from:
- Team logos: Official NBA team websites
- Player photos: NBA.com draft profiles
- Or use the placeholder service for testing