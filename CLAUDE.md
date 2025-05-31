# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an NBA-themed network automation repository that combines AWS CloudFormation infrastructure as code with GitHub Actions CI/CD pipelines. The project uses basketball terminology throughout (VPCs are "Arenas", Subnets are "Court Sections", etc.).

## Key Architecture Components

### Infrastructure (CloudFormation)
- **Main VPC Template**: `infrastructure/cloudformation/vpc/nba-cloud-vpc.yml`
  - Creates VPC with public/private subnets, Internet Gateway, NAT Gateway, security groups, and VPC Flow Logs
  - Includes IAM roles and policies for monitoring
  - Outputs are designed for cross-stack references

### CI/CD (GitHub Actions)
Three main workflows in `.github/workflows/`:
1. **deploy-vpc.yml**: Deploys VPC infrastructure on push to main or manual trigger
2. **network-validation.yml**: Validates configurations and security on PRs
3. **monitoring-checks.yml**: Runs health checks every 15 minutes

### Python Automation Layer (Not Yet Implemented)
The README references Python scripts that need to be created:
- `scripts/deploy_infrastructure.py`
- `scripts/validate_network.py`
- `scripts/cleanup_resources.py`

## Development Commands

### Python Setup (when implemented)
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt  # Note: requirements.txt doesn't exist yet
```

### AWS CLI Commands
```bash
# Validate CloudFormation template
aws cloudformation validate-template --template-body file://infrastructure/cloudformation/vpc/nba-cloud-vpc.yml

# Deploy stack
aws cloudformation deploy \
  --stack-name nba-arena-vpc \
  --template-file infrastructure/cloudformation/vpc/nba-cloud-vpc.yml \
  --capabilities CAPABILITY_NAMED_IAM

# Check stack status
aws cloudformation describe-stacks --stack-name nba-arena-vpc
```

### GitHub Actions Manual Triggers
```bash
gh workflow run deploy-vpc.yml --field environment=dev --field region=us-east-1
```

## AWS Credentials Configuration

The repository supports two authentication methods:
1. **IAM User Credentials**: Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub Secrets
2. **OIDC (Recommended)**: Configure trust relationship between GitHub and AWS IAM role

See `docs/aws-credentials-setup.md` for detailed setup instructions.

## Important Notes

1. **Python Implementation Missing**: The Python scripts referenced in workflows and documentation need to be created
2. **No Test Implementation**: Test directories exist but contain no tests
3. **Requirements File Missing**: Create `requirements.txt` with necessary dependencies (boto3, click, etc.)
4. **Workflow References**: GitHub Actions reference non-existent Python scripts that need implementation

## Directory Structure Context

- **infrastructure/cloudformation/**: Infrastructure as Code templates
- **scripts/**: Should contain Python automation scripts (currently empty)
- **.github/workflows/**: CI/CD pipeline definitions
- **docs/**: Documentation including AWS setup guides
- **tests/**: Test directories (currently empty)

## Common Tasks

When implementing new features:
1. Follow the NBA theme in naming and documentation
2. Ensure CloudFormation templates are validated before deployment
3. Update GitHub Actions workflows if new scripts are added
4. Add appropriate IAM permissions to the CloudFormation IAM roles