# How to Add GitHub Secrets

## Step 1: Go to Repository Settings

1. Navigate to your repository on GitHub
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions** in the left sidebar

## Step 2: Add Required Secrets

Click **New repository secret** for each of these:

### Docker Hub Secrets

**Name:** `DOCKER_USERNAME`  
**Value:** Your Docker Hub username (e.g., `ibrahimfattah`)

**Name:** `DOCKER_PASSWORD`  
**Value:** Your Docker Hub password or access token (recommended to use access token)

To create a Docker Hub access token:
1. Go to https://hub.docker.com/settings/security
2. Click **New Access Token**
3. Give it a name like "GitHub Actions"
4. Copy the token and use it as the secret value

### Server SSH Secrets

**Name:** `SERVER_IP`  
**Value:** Your server IP address (e.g., `192.168.1.100` or `your-server.com`)

**Name:** `SSH_USERNAME`  
**Value:** SSH username (e.g., `root`, `ubuntu`, or `ibrahimfattah`)

**Name:** `SSH_KEY`  
**Value:** Your private SSH key content

Generate SSH key if you don't have one:
```bash
ssh-keygen -t ed25519 -C "github-actions"
# Press Enter to save to default location
# Press Enter twice for no passphrase (required for automation)
cat ~/.ssh/id_ed25519  # This is your private key (add as SECRET)
cat ~/.ssh/id_ed25519.pub  # This is your public key (add to server)
```

Add the public key to your server:
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server-ip
```

Or manually:
```bash
# On your server
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Test Deployment

1. Push code to `main` branch
2. Go to **Actions** tab in GitHub
3. Watch the "Deploy to Server" workflow run
4. Check if all steps complete successfully

## Troubleshooting

- If SSH fails: Verify the private key has no passphrase
- If Docker Hub push fails: Check DOCKER_USERNAME and DOCKER_PASSWORD
- View detailed logs in GitHub Actions tab
