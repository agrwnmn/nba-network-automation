# AWS Credentials Setup for GitHub Actions

This guide explains how to configure AWS credentials in GitHub Secrets for use with GitHub Actions workflows.

## Option 1: Basic IAM User Credentials

### Prerequisites
- AWS account with appropriate permissions
- Access to GitHub repository settings

### Steps

1. **Create an IAM User in AWS**
   - Navigate to AWS IAM Console
   - Click "Users" → "Add users"
   - Enter a username (e.g., `github-actions-user`)
   - Select "Programmatic access" for access type
   - Click "Next: Permissions"

2. **Assign Permissions**
   - Choose one of the following methods:
     - Attach existing policies directly
     - Add user to group with required policies
     - Create custom policy with minimal required permissions
   - Click "Next: Tags" → "Next: Review" → "Create user"

3. **Save Credentials**
   - Download the CSV file or copy the Access Key ID and Secret Access Key
   - **Important**: This is the only time you'll see the secret access key

4. **Add Secrets to GitHub**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add the following secrets:
     - Name: `AWS_ACCESS_KEY_ID`
       Value: Your Access Key ID
     - Name: `AWS_SECRET_ACCESS_KEY`
       Value: Your Secret Access Key
     - Name: `AWS_DEFAULT_REGION` (optional)
       Value: Your preferred AWS region (e.g., `us-east-1`)

5. **Use in GitHub Actions**
   ```yaml
   - name: Configure AWS credentials
     uses: aws-actions/configure-aws-credentials@v4
     with:
       aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
       aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
       aws-region: ${{ secrets.AWS_DEFAULT_REGION }}
   ```

## Option 2: OIDC (Recommended)

OpenID Connect (OIDC) allows GitHub Actions to authenticate with AWS without storing long-lived credentials.

### Prerequisites
- AWS account with permissions to create IAM roles and identity providers
- GitHub repository

### Steps

1. **Create an OIDC Identity Provider in AWS**
   - Navigate to AWS IAM Console
   - Click "Identity providers" → "Add provider"
   - Select "OpenID Connect"
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
   - Click "Add provider"

2. **Create an IAM Role**
   - Go to IAM → Roles → "Create role"
   - Select "Web identity"
   - Identity provider: Select the GitHub OIDC provider you created
   - Audience: `sts.amazonaws.com`
   - Click "Next"

3. **Configure Trust Policy**
   - Update the trust policy to restrict access to your repository:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/YOUR_REPO_NAME:*"
           }
         }
       }
     ]
   }
   ```
   - Replace `YOUR_ACCOUNT_ID`, `YOUR_GITHUB_ORG`, and `YOUR_REPO_NAME`

4. **Attach Permissions**
   - Add required AWS permissions policies to the role
   - Complete role creation and note the Role ARN

5. **Add Role ARN to GitHub Secrets**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add new secret:
     - Name: `AWS_ROLE_TO_ASSUME`
     - Value: Your Role ARN (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole`)

6. **Configure GitHub Actions Workflow**
   ```yaml
   jobs:
     deploy:
       runs-on: ubuntu-latest
       permissions:
         id-token: write  # Required for OIDC
         contents: read
       
       steps:
         - name: Configure AWS credentials
           uses: aws-actions/configure-aws-credentials@v4
           with:
             role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
             aws-region: us-east-1
   ```

## Security Best Practices

1. **For IAM Users:**
   - Use minimal required permissions
   - Rotate credentials regularly
   - Enable MFA when possible
   - Monitor usage with CloudTrail

2. **For OIDC (Recommended):**
   - Restrict trust policy to specific repositories/branches
   - Use session tags for additional security
   - Implement least-privilege permissions
   - Regular security audits

3. **General:**
   - Never commit credentials to code
   - Use environment-specific credentials
   - Implement proper secret rotation
   - Monitor for unauthorized access

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify secret names match exactly
   - Check IAM permissions
   - Ensure region is correctly set

2. **OIDC Token Errors**
   - Verify trust policy conditions
   - Check `permissions` block in workflow
   - Ensure identity provider is correctly configured

3. **Permission Denied**
   - Review IAM policies attached to user/role
   - Check resource-specific permissions
   - Verify service limits

### Debug Steps

1. Enable debug logging in GitHub Actions:
   ```yaml
   env:
     ACTIONS_RUNNER_DEBUG: true
     ACTIONS_STEP_DEBUG: true
   ```

2. Test credentials locally:
   ```bash
   aws sts get-caller-identity
   ```

3. Review CloudTrail logs for detailed error information

## Additional Resources

- [AWS Actions for GitHub Actions](https://github.com/aws-actions/configure-aws-credentials)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)