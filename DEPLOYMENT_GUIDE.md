# NBA Draft Map Website Deployment Guide

This guide walks you through deploying the NBA Draft Map website infrastructure and uploading the website files.

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- IAM permissions for CloudFormation, S3, CloudFront, Lambda, and IAM operations
- Environment: `dev`
- Region: `us-east-1`

## Deployment Steps

### 1. Check VPC Stack Status

First, verify that the VPC infrastructure is deployed successfully:

```bash
aws cloudformation describe-stacks \
  --stack-name nba-arena-vpc-dev \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus' \
  --output text
```

Expected output: `CREATE_COMPLETE` or `UPDATE_COMPLETE`

### 2. Deploy Website Infrastructure

Deploy the website CloudFormation stack:

```bash
aws cloudformation deploy \
  --stack-name nba-draft-website-dev \
  --template-file infrastructure/cloudformation/s3/nba-draft-website.yml \
  --parameter-overrides EnvironmentName=nba-network \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1 \
  --tags Project=nba-network-automation Environment=dev ManagedBy=manual Team=nba-network-ops
```

This creates:
- S3 bucket for static website hosting
- CloudFront distribution for HTTPS and performance
- Lambda function for deployment automation
- Required IAM roles and policies

### 3. Get Stack Outputs

Once the stack deployment completes, retrieve the outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name nba-draft-website-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table
```

Note down:
- **WebsiteBucket**: The S3 bucket name
- **CloudFrontURL**: The HTTPS URL for accessing the website
- **CloudFrontDistributionId**: The distribution ID (for cache invalidation)

### 4. Upload Website Files

Replace `BUCKET_NAME` with the actual bucket name from step 3:

```bash
aws s3 sync website/ s3://BUCKET_NAME/ --region us-east-1 --delete
```

This uploads:
- `index.html` - Main HTML page
- `css/style.css` - Styling
- `js/app.js` - Interactive map functionality
- `data/draft-2024.json` - Player data
- All assets in the `assets/` directory

### 5. (Optional) Invalidate CloudFront Cache

If updating existing files, clear the CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths '/*' \
  --region us-east-1
```

### 6. Access the Website

The website is accessible at:
- **CloudFront URL (Recommended)**: `https://DISTRIBUTION_ID.cloudfront.net`
- **S3 Website URL**: `http://BUCKET_NAME.s3-website-us-east-1.amazonaws.com`

⏱️ **Note**: CloudFront distribution creation takes 15-20 minutes to complete.

## Website Features

The NBA Draft Map includes:
- Interactive map showing player origins
- Player statistics and information
- Responsive design for mobile and desktop
- Team and player filtering capabilities

## Troubleshooting

### Stack Creation Failed
- Check AWS credentials and permissions
- Verify the CloudFormation template syntax
- Review CloudFormation events for specific errors

### Website Not Loading
- Ensure all files were uploaded to S3
- Check S3 bucket policy allows public access
- Verify CloudFront distribution is deployed (check status in AWS Console)

### 403 Forbidden Errors
- Confirm the S3 bucket policy is correctly applied
- Check that the index document is set to `index.html`
- Ensure CloudFront is using the correct origin

## Clean Up

To remove all resources:

```bash
# Delete website files first
aws s3 rm s3://BUCKET_NAME/ --recursive --region us-east-1

# Delete the CloudFormation stack
aws cloudformation delete-stack \
  --stack-name nba-draft-website-dev \
  --region us-east-1
```

## Next Steps

Once deployed, you can:
- Monitor website traffic through CloudFront metrics
- Set up custom domain using Route 53
- Enable CloudFront access logs for analytics
- Add more player data and features to the map