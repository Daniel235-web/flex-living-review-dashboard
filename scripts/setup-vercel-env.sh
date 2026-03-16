#!/bin/bash
# ═══════════════════════════════════════════════════════════
# FlexLiving DAO — Set Vercel Environment Variables
# Run after: vercel login && vercel (first deploy)
# ═══════════════════════════════════════════════════════════

echo "🔧 Setting Vercel environment variables for FlexLiving DAO..."
echo ""

# Contract addresses from Polkadot Hub Testnet deployment
declare -A VARS
VARS[NEXT_PUBLIC_MOCK_USDC_ADDRESS]="0x077Ec3472EcCCED381cf53EE0D97841aF5295244"
VARS[NEXT_PUBLIC_FLEX_TOKEN_ADDRESS]="0xE508FeAFeAd876425Bb5C8ed7423860a5E0Dc116"
VARS[NEXT_PUBLIC_PROPERTY_NFT_ADDRESS]="0x6d2Ee9974932fd77Fdf4B464A8B72593E241c79c"
VARS[NEXT_PUBLIC_REPUTATION_SBT_ADDRESS]="0x9671d9e353D2a45239bc6c3cf42990bE1f0F5BF7"
VARS[NEXT_PUBLIC_RENT_ESCROW_ADDRESS]="0xF6007e3d9ff10CaD2F4CD86455EAEB7cd7D4bB0D"
VARS[NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS]="0xA35F0f668e8eeb0e288edBDCa5571d8D90032A62"
VARS[NEXT_PUBLIC_TIMELOCK_ADDRESS]="0x7A6d529779A97B23fbb1e0Fe82BAD0B25990d217"
VARS[NEXT_PUBLIC_GOVERNOR_ADDRESS]="0xC2d7F62B44bcF9FDc14f03ca81cC2Ce0E9d20dAB"
VARS[NEXT_PUBLIC_WC_PROJECT_ID]="demo"

for key in "${!VARS[@]}"; do
  echo "  Setting $key..."
  echo "${VARS[$key]}" | vercel env add "$key" production --force 2>/dev/null
done

echo ""
echo "✅ All environment variables set!"
echo ""
echo "Now redeploy with:  vercel --prod"
