#!/usr/bin/env python3
"""
NBA Draft Map Website Deployment Script
Deploys the static website infrastructure and uploads files to S3
"""

import json
import os
import sys
from pathlib import Path

def main():
    """
    Main deployment function - provides AWS CLI commands for manual execution
    """
    
    # Configuration
    environment = "dev"
    region = "us-east-1"
    stack_name = f"nba-draft-website-{environment}"
    template_path = "infrastructure/cloudformation/s3/nba-draft-website.yml"
    website_dir = "website"
    
    print("🏀 NBA Draft Map Website Deployment Guide")
    print("=" * 50)
    print(f"Environment: {environment}")
    print(f"Region: {region}")
    print(f"Stack Name: {stack_name}")
    print("\n")
    
    # Step 1: Check VPC Stack Status
    print("📋 Step 1: Check VPC Stack Status")
    print("Run the following command:")
    print(f"aws cloudformation describe-stacks --stack-name nba-arena-vpc-{environment} --region {region} --query 'Stacks[0].StackStatus' --output text")
    print("\n")
    
    # Step 2: Deploy Website Stack
    print("🚀 Step 2: Deploy Website CloudFormation Stack")
    print("Run the following command:")
    print(f"""aws cloudformation deploy \\
    --stack-name {stack_name} \\
    --template-file {template_path} \\
    --parameter-overrides EnvironmentName=nba-network \\
    --capabilities CAPABILITY_NAMED_IAM \\
    --region {region} \\
    --tags Project=nba-network-automation Environment={environment} ManagedBy=manual Team=nba-network-ops""")
    print("\n")
    
    # Step 3: Get Stack Outputs
    print("📊 Step 3: Get Stack Outputs (after deployment completes)")
    print("Run the following command to get the S3 bucket name and CloudFront URL:")
    print(f"""aws cloudformation describe-stacks \\
    --stack-name {stack_name} \\
    --region {region} \\
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \\
    --output table""")
    print("\n")
    
    # Step 4: Upload Website Files
    print("📤 Step 4: Upload Website Files to S3")
    print("After getting the bucket name from step 3, run these commands:")
    print(f"# Replace BUCKET_NAME with the actual bucket name from the stack outputs")
    print(f"aws s3 sync {website_dir}/ s3://BUCKET_NAME/ --region {region} --delete")
    print("\n")
    
    # Step 5: Invalidate CloudFront Cache
    print("🔄 Step 5: Invalidate CloudFront Cache (optional)")
    print("If updating existing files, invalidate the CloudFront cache:")
    print(f"# Replace DISTRIBUTION_ID with the actual ID from the stack outputs")
    print(f"aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths '/*' --region {region}")
    print("\n")
    
    # Step 6: Access the Website
    print("🌐 Step 6: Access the Website")
    print("Once deployment is complete, you can access the website at:")
    print("- S3 Website URL: http://BUCKET_NAME.s3-website-{region}.amazonaws.com")
    print("- CloudFront URL (HTTPS): https://DISTRIBUTION_ID.cloudfront.net")
    print("\n")
    
    # Additional Notes
    print("📝 Additional Notes:")
    print("- The CloudFront distribution may take 15-20 minutes to fully deploy")
    print("- Use the CloudFront URL for HTTPS access")
    print("- The S3 bucket is configured for static website hosting")
    print("- All files in the 'website' directory will be uploaded")
    print("\n")
    
    # File List
    print("📁 Files to be uploaded:")
    website_path = Path(website_dir)
    if website_path.exists():
        for file in website_path.rglob("*"):
            if file.is_file():
                relative_path = file.relative_to(website_path)
                print(f"  - {relative_path}")
    else:
        print(f"  ⚠️  Website directory '{website_dir}' not found!")
    
    print("\n✅ Follow the steps above to deploy the NBA Draft Map website!")

if __name__ == "__main__":
    main()