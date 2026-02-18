#!/bin/bash

echo "TEATO Setup Script"
echo "==================="
echo ""

echo "[1/4] Installing server dependencies..."
cd server && npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Server install failed"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Installing client dependencies..."
cd client && npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Client install failed"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Creating uploads directory..."
mkdir -p server/uploads

echo ""
echo "[4/4] Checking environment files..."
if [ ! -f server/.env ]; then
    echo "WARNING: server/.env not found. Copying from example..."
    cp server/.env.example server/.env
    echo "Created server/.env - please edit with your MongoDB URI and JWT_SECRET"
fi

if [ ! -f client/.env ]; then
    echo "WARNING: client/.env not found. Copying from example..."
    cp client/.env.example client/.env
fi

echo ""
echo "==================="
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your MongoDB URI"
echo "2. Run: cd server && npm run seed"
echo "3. Run: cd server && npm run dev  (Terminal 1)"
echo "4. Run: cd client && npm start     (Terminal 2)"
echo ""
