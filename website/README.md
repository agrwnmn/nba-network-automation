# 🏀 NBA Draft 2024 - Interactive Map

An interactive web map showing the origins of 2024 NBA draft picks, displaying their high school locations (or birthplace for international players).

## Features

- **Interactive World Map**: Powered by Leaflet.js with dark theme
- **Player Markers**: Numbered pins showing draft position
  - 🟡 Yellow pins: USA players (high school location)
  - 🔴 Red pins: International players (birthplace)
- **Hover Details**: See player info, team, and location on hover
- **Sidebar**: Complete draft list with click-to-zoom functionality
- **Statistics Bar**: Shows total players, USA vs International breakdown
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

This website is deployed as part of the NBA Network Automation infrastructure:

1. **S3 Static Website Hosting**: Files served from S3 bucket
2. **CloudFront CDN**: HTTPS delivery with global edge locations
3. **CloudFormation**: Infrastructure as code deployment
4. **GitHub Actions**: Automated deployment pipeline

## Deployment

The website is automatically deployed when:
- Changes are pushed to the `website/` directory
- The full infrastructure deployment workflow runs

Manual deployment:
```bash
# Deploy just the website content
./scripts/deploy-website.sh dev

# Or use the GitHub Action
gh workflow run deploy-with-website.yml \
  --field environment="dev" \
  --field deploy_website="true"
```

## Data Structure

The draft data is stored in `data/draft-2024.json`:

```json
{
  "draft_year": 2024,
  "players": [
    {
      "draft_position": 1,
      "name": "Player Name",
      "team": "Team Name",
      "team_logo": "team.png",
      "profile_photo": "player.jpg",
      "high_school": {
        "name": "School Name",
        "city": "City",
        "state": "State",
        "country": "USA",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "birthplace": null,
      "is_international": false
    }
  ]
}
```

## Customization

### Adding/Updating Players
1. Edit `data/draft-2024.json`
2. Add player images to `assets/img/players/`
3. Add team logos to `assets/img/teams/`
4. Deploy changes

### Styling
- Main styles: `css/style.css`
- Uses NBA colors:
  - Primary Blue: `#1d428a`
  - Red: `#c8102e`
  - Gold: `#f5b800`
  - Dark Background: `#0a0e27`

### Map Configuration
- Edit `js/app.js` to change:
  - Initial map center and zoom
  - Marker styles and colors
  - Popup content format

## Local Development

To test locally:
1. Start a local server: `python -m http.server 8000`
2. Open browser to: `http://localhost:8000`

Note: The data fetch requires a web server due to CORS policies.

## Cost Optimization

- S3 storage: ~$0.023/GB/month
- CloudFront: ~$0.085/GB transfer
- Typical monthly cost: < $1.00

The website is included in the auto-destroy workflows to prevent unnecessary costs.

## Future Enhancements

- Add previous years' draft data
- Include college information
- Add player statistics
- Create comparison features
- Add search/filter functionality
- Include draft day trades visualization