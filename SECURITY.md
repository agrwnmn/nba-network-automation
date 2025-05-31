# 🔒 Security Guide for NBA Network Automation

## Current Security Model

### ✅ What's Protected:
- AWS credentials are stored in GitHub Secrets (encrypted)
- Secrets are only available during workflow runs
- Workflows require explicit confirmation for destructive actions

### ⚠️ Potential Risks for Public Repositories:

1. **Fork Attacks**: Someone forks your repo and modifies workflows
2. **PR-based Attacks**: Malicious PRs attempting to access secrets
3. **Workflow Triggers**: Unauthorized workflow executions

## 🛡️ Recommended Security Improvements

### 1. **Enable GitHub Security Features** (IMMEDIATE)

Go to Repository Settings → Security & Analysis:
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates
- ✅ Enable Secret scanning
- ✅ Enable Code scanning

### 2. **Restrict Workflow Permissions**

Add to Repository Settings → Actions → General:
- Set "Fork pull request workflows" to "Require approval for all outside collaborators"
- Set workflow permissions to "Read repository contents permission"

### 3. **Implement Branch Protection Rules**

Settings → Branches → Add rule for `main`:
- ✅ Require pull request reviews before merging
- ✅ Dismiss stale pull request approvals
- ✅ Require status checks to pass
- ✅ Restrict who can push to matching branches
- ✅ Require up-to-date branches before merging

### 4. **AWS Security Best Practices**

#### Option A: Restrict IAM User (RECOMMENDED)
Update your `carter-githubactions-user` IAM policy to:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RestrictToGitHubActions",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringNotLike": {
          "aws:userid": "AIDAR7LLEY4O6IBPGPVDK:*"
        }
      }
    },
    {
      "Sid": "RestrictExpensiveServices",
      "Effect": "Deny",
      "Action": [
        "ec2:RunInstances",
        "rds:CreateDB*",
        "elasticache:Create*"
      ],
      "Resource": "*",
      "Condition": {
        "ForAllValues:StringNotEquals": {
          "ec2:InstanceType": ["t2.micro", "t3.micro"]
        }
      }
    }
  ]
}
```

#### Option B: Use OIDC Authentication (MOST SECURE)
Replace AWS access keys with GitHub OIDC:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::136053049117:role/GitHubActionsRole
    aws-region: us-east-1
```

### 5. **Add Cost Controls in AWS**

1. **Set up AWS Budgets**:
   - Create a monthly budget alert at $10
   - Set up anomaly detection

2. **Enable Cost Allocation Tags**:
   - All resources created include cost tracking tags

3. **Use AWS Organizations**:
   - Set spending limits on the account

### 6. **Workflow Security Improvements**

Add environment protection rules:

```yaml
jobs:
  deploy:
    environment: production
    # This requires manual approval for production deployments
```

### 7. **Regular Security Audits**

1. **Weekly**: Review AWS CloudTrail logs
2. **Monthly**: Rotate AWS access keys
3. **Quarterly**: Review IAM permissions

## 🚨 Emergency Response Plan

If you suspect unauthorized access:

1. **IMMEDIATELY**: Deactivate the AWS access keys
   ```bash
   aws iam update-access-key --access-key-id AKIA... --status Inactive
   ```

2. **Check AWS Usage**:
   - Review CloudTrail logs
   - Check Cost Explorer for unusual charges
   - List all running resources

3. **Rotate Credentials**:
   - Generate new access keys
   - Update GitHub Secrets
   - Delete old access keys

4. **Review and Terminate**:
   - Check all regions for unexpected resources
   - Use the cleanup workflow to remove unauthorized resources

## 📊 Cost Protection Checklist

- [ ] AWS Budget alerts configured
- [ ] IAM user has minimal required permissions
- [ ] Workflow approvals required for external contributors
- [ ] Branch protection enabled on main
- [ ] Regular key rotation schedule set
- [ ] Cost allocation tags on all resources
- [ ] GitHub security features enabled

## 🔐 GitHub Secrets Security

Your secrets are protected by:
- Encryption at rest
- Masked in logs (shown as ***)
- Not available to forked repositories
- Not exposed in PR from forks

However, for maximum security on a public repo, consider:
- Using OIDC instead of long-lived credentials
- Restricting workflow triggers
- Requiring manual approval for deployments

Remember: **Defense in depth** - use multiple layers of security!