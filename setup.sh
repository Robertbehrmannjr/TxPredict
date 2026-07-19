#!/bin/bash
echo "=== TxPredict Setup Script ==="

# 1. Install NVM & Node 20 if not installed
if ! command -v node &> /dev/null
then
    echo "Installing Node.js via NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 2. Setup Node Keeper
echo "Setting up Node Keeper..."
cd txpredict-node-keeper
npm install
# Create dummy .env for the video recording
cat <<EOF > .env
TXODDS_JWT=dummy_jwt_for_video
TXODDS_API_TOKEN=dummy_api_token_for_video
EOF
cd ..

# 3. Setup Frontend
echo "Setting up Frontend..."
cd txpredict-frontend
npm install
cd ..

echo "=== Setup Complete ==="
echo "To start the frontend, run: cd txpredict-frontend && npm run dev"
echo "To start the keeper, run: cd txpredict-node-keeper && npm start"
