import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Price API called');
    const { searchParams } = new URL(request.url);
    const usdAmount = searchParams.get('amount');
    const chainId = searchParams.get('chainId');

    console.log('Received params:', { usdAmount, chainId });

    if (!usdAmount) {
      return NextResponse.json(
        { error: 'USD amount is required' },
        { status: 400 }
      );
    }

    const amount = parseFloat(usdAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid USD amount' },
        { status: 400 }
      );
    }

    console.log('Processing amount:', amount);

    // Chain to native token mapping - only Solana
    const CHAIN_NATIVE_TOKENS: Record<string, string> = {
      'solana': 'SOL'  // Solana - SOL for gas
    };

    // Display names for tokens (what users see)
    const CHAIN_DISPLAY_TOKENS: Record<string, string> = {
      'solana': 'SOL'  // Solana
    };

    // Pyth price feed IDs - only SOL
    const PRICE_FEED_IDS: Record<string, string> = {
      SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',   // SOL/USD
    };

    // If specific chain is requested
    if (chainId) {
      const displayToken = CHAIN_DISPLAY_TOKENS[chainId];
      const priceToken = CHAIN_NATIVE_TOKENS[chainId];
      
      if (!displayToken || !priceToken) {
        return NextResponse.json({
          error: `Unsupported chain ID: ${chainId}`
        }, { status: 400 });
      }

      // For Solana, use SOL directly
      const tokenForPrice = displayToken;
      const feedId = PRICE_FEED_IDS[tokenForPrice];
      
      if (!feedId) {
        return NextResponse.json({
          error: `No price feed for token: ${tokenForPrice}`
        }, { status: 400 });
      }

      const pythUrl = `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${encodeURIComponent(feedId)}`;
      console.log(`Fetching ${tokenForPrice} price for chain ${chainId} from:`, pythUrl);
      
      const pythResponse = await fetch(pythUrl);
      console.log('Pyth response status:', pythResponse.status);
      
      if (!pythResponse.ok) {
        const errorText = await pythResponse.text();
        console.error('Pyth API error:', errorText);
        return NextResponse.json({
          error: 'Pyth API error',
          status: pythResponse.status,
          details: errorText
        }, { status: 500 });
      }
      
      const pythData = await pythResponse.json();
      console.log('Pyth data received:', pythData);
      
      const priceFeed = pythData[0];
      if (!priceFeed || !priceFeed.price) {
        return NextResponse.json({
          error: 'No price data available'
        }, { status: 500 });
      }
      
      const price = parseInt(priceFeed.price.price);
      const exponent = priceFeed.price.expo;
      const tokenPrice = price * Math.pow(10, exponent);
      const nativeAmount = amount / tokenPrice;
      
      console.log(`Calculated ${tokenForPrice} price: $${tokenPrice}`);
      
      return NextResponse.json({
        success: true,
        data: {
          usdAmount: amount,
          chainId,
          nativeAmount,
          tokenSymbol: displayToken, // Show display token (ARB, OP, etc.)
          price: tokenPrice
        }
      });
    }

    // Get conversions for all supported chains (for preview)
    const conversions: Record<string, { nativeAmount: number; tokenSymbol: string; price: number }> = {};
    
    // Get all unique tokens we need prices for
    const allTokensNeeded = new Set<string>();
    
    for (const chainId of Object.keys(CHAIN_DISPLAY_TOKENS)) {
      const displayToken = CHAIN_DISPLAY_TOKENS[chainId];
      const priceToken = CHAIN_NATIVE_TOKENS[chainId];
      
      // For Solana, use SOL directly
      if (chainId === 'solana') {
        allTokensNeeded.add(displayToken);
      }
    }
    
    const tokenPrices: Record<string, number> = {};
    
    // Fetch prices for all needed tokens
    for (const token of Array.from(allTokensNeeded)) {
      const feedId = PRICE_FEED_IDS[token];
      if (!feedId) continue;
      
      try {
        const pythUrl = `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${encodeURIComponent(feedId)}`;
        console.log(`Fetching ${token} price from:`, pythUrl);
        
        const pythResponse = await fetch(pythUrl);
        if (!pythResponse.ok) {
          const errorText = await pythResponse.text();
          console.error(`Failed to fetch ${token} price. Status: ${pythResponse.status}, Response:`, errorText);
          continue;
        }
        
        const pythData = await pythResponse.json();
        console.log(`${token} raw response:`, JSON.stringify(pythData).substring(0, 200));
        const priceFeed = pythData[0];
        
        if (priceFeed && priceFeed.price) {
          const price = parseInt(priceFeed.price.price);
          const exponent = priceFeed.price.expo;
          tokenPrices[token] = price * Math.pow(10, exponent);
          console.log(`${token} price: $${tokenPrices[token]}`);
        } else {
          console.error(`No price data in response for ${token}:`, pythData);
        }
      } catch (error) {
        console.error(`Error fetching ${token} price:`, error);
      }
    }
    
    // Calculate conversions for each chain
    for (const chainId of Object.keys(CHAIN_DISPLAY_TOKENS)) {
      const displayToken = CHAIN_DISPLAY_TOKENS[chainId];
      const priceToken = CHAIN_NATIVE_TOKENS[chainId];
      
      // For Solana, use SOL directly
      const tokenForPrice = displayToken;
      const tokenPrice = tokenPrices[tokenForPrice];
      
      if (tokenPrice) {
        conversions[chainId] = {
          nativeAmount: amount / tokenPrice,
          tokenSymbol: displayToken, // Always show the display token
          price: tokenPrice
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        usdAmount: amount,
        conversions
      }
    });

  } catch (error) {
    console.error('Price API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch price data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint to get current prices for all supported tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens } = body;

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        { error: 'Tokens array is required' },
        { status: 400 }
      );
    }

    // TODO: Implement bulk price fetching or remove this endpoint
    return NextResponse.json({
      success: true,
      data: {
        prices: {},
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Bulk Price API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bulk price data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
