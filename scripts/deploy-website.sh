#!/bin/bash
# Deploy NBA Draft Map Website to S3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Get environment name from parameter or use default
ENVIRONMENT="${1:-dev}"
BUCKET_NAME=""
CLOUDFRONT_ID=""

print_status "🏀 Deploying NBA Draft Map Website"
print_status "Environment: $ENVIRONMENT"

# Get the S3 bucket name from CloudFormation stack
get_bucket_info() {
    print_status "Getting bucket information from CloudFormation..."
    
    STACK_NAME="nba-arena-website-${ENVIRONMENT}"
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" &>/dev/null; then
        BUCKET_NAME=$(aws cloudformation describe-stacks \
            --stack-name "$STACK_NAME" \
            --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucket`].OutputValue' \
            --output text)
        
        CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
            --stack-name "$STACK_NAME" \
            --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
            --output text)
        
        print_status "Bucket: $BUCKET_NAME"
        print_status "CloudFront ID: $CLOUDFRONT_ID"
    else
        print_error "CloudFormation stack '$STACK_NAME' not found. Deploy the infrastructure first."
        exit 1
    fi
}

# Upload website files to S3
upload_files() {
    print_status "Uploading website files to S3..."
    
    # Set the correct working directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    WEBSITE_DIR="${SCRIPT_DIR}/../website"
    
    if [ ! -d "$WEBSITE_DIR" ]; then
        print_error "Website directory not found: $WEBSITE_DIR"
        exit 1
    fi
    
    # Upload HTML files
    aws s3 cp "$WEBSITE_DIR/index.html" "s3://$BUCKET_NAME/" \
        --content-type "text/html" \
        --cache-control "max-age=300"
    
    # Upload CSS files
    if [ -d "$WEBSITE_DIR/css" ]; then
        aws s3 sync "$WEBSITE_DIR/css" "s3://$BUCKET_NAME/css" \
            --content-type "text/css" \
            --cache-control "max-age=86400" \
            --delete
    fi
    
    # Upload JavaScript files
    if [ -d "$WEBSITE_DIR/js" ]; then
        aws s3 sync "$WEBSITE_DIR/js" "s3://$BUCKET_NAME/js" \
            --content-type "application/javascript" \
            --cache-control "max-age=86400" \
            --delete
    fi
    
    # Upload data files
    if [ -d "$WEBSITE_DIR/data" ]; then
        aws s3 sync "$WEBSITE_DIR/data" "s3://$BUCKET_NAME/data" \
            --content-type "application/json" \
            --cache-control "max-age=3600" \
            --delete
    fi
    
    # Upload assets (images)
    if [ -d "$WEBSITE_DIR/assets" ]; then
        aws s3 sync "$WEBSITE_DIR/assets" "s3://$BUCKET_NAME/assets" \
            --cache-control "max-age=604800" \
            --delete
    fi
    
    print_status "✅ Files uploaded successfully!"
}

# Invalidate CloudFront cache
invalidate_cache() {
    if [ -n "$CLOUDFRONT_ID" ]; then
        print_status "Invalidating CloudFront cache..."
        
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_ID" \
            --paths "/*" \
            --query 'Invalidation.Id' \
            --output text)
        
        print_status "CloudFront invalidation created: $INVALIDATION_ID"
    else
        print_warning "No CloudFront distribution found. Skipping cache invalidation."
    fi
}

# Get website URLs
display_urls() {
    print_status "🌐 Website URLs:"
    
    # S3 Website URL
    S3_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
        --output text)
    
    # CloudFront URL
    CF_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
        --output text)
    
    echo ""
    print_status "S3 Website URL: $S3_URL"
    print_status "CloudFront URL (HTTPS): $CF_URL"
    echo ""
    print_status "🎉 NBA Draft Map is live! Visit the CloudFront URL to see your interactive map."
}

# Main deployment flow
main() {
    print_status "Starting NBA Draft Map deployment..."
    
    get_bucket_info
    upload_files
    invalidate_cache
    display_urls
    
    print_status "✅ Deployment complete!"
}

# Run the deployment
main