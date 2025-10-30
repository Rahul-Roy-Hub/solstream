import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Pyth API directly...');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'; // default ETH
    const url = `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${encodeURIComponent(id)}`;
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoCheckout/1.0'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return NextResponse.json({
        error: 'Pyth API error',
        status: response.status,
        details: errorText
      }, { status: 500 });
    }
    
    const data = await response.json();
    console.log('Success! Data received:', data);
    
    const priceFeed = data[0];
    if (priceFeed && priceFeed.price) {
      const price = parseInt(priceFeed.price.price);
      const exponent = priceFeed.price.expo;
      const actualPrice = price * Math.pow(10, exponent);
      
      return NextResponse.json({
        success: true,
        data: {
          rawPrice: priceFeed.price.price,
          exponent: priceFeed.price.expo,
          calculatedPrice: actualPrice,
          fullResponse: data
        }
      });
    }
    
    return NextResponse.json({
      error: 'No price data in response',
      data: data
    }, { status: 500 });
    
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
