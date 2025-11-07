/**
 * IP Geolocation API Route
 * Detects user's country from IP address
 * Uses free IP geolocation services
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/geolocation
 * Returns user's country code based on IP address
 */
export async function GET(request: NextRequest) {
  try {
    // Get client IP from request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || request.ip || '';

    // Use free IP geolocation API (ipapi.co)
    // Fallback to ip-api.com if first fails
    let countryCode = 'US'; // Default fallback
    let countryName = 'United States';

    try {
      // Try ipapi.co first (free tier: 1000 requests/day)
      const ipapiResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: {
          'User-Agent': 'Web3News/1.0',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (ipapiResponse.ok) {
        const data = await ipapiResponse.json();
        if (data.country_code && !data.error) {
          countryCode = data.country_code;
          countryName = data.country_name || countryCode;
        }
      }
    } catch (ipapiError) {
      console.warn('ipapi.co failed, trying ip-api.com:', ipapiError);
      
      // Fallback to ip-api.com (free tier: 45 requests/minute)
      try {
        const ipApiResponse = await fetch(`http://ip-api.com/json/${ip}`, {
          headers: {
            'User-Agent': 'Web3News/1.0',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (ipApiResponse.ok) {
          const data = await ipApiResponse.json();
          if (data.countryCode && data.status === 'success') {
            countryCode = data.countryCode;
            countryName = data.country || countryCode;
          }
        }
      } catch (ipApiError) {
        console.warn('ip-api.com also failed, using default:', ipApiError);
      }
    }

    return NextResponse.json({
      countryCode,
      countryName,
      ip,
      detected: countryCode !== 'US' || ip !== '',
    });
  } catch (error: any) {
    console.error('Error detecting geolocation:', error);
    return NextResponse.json(
      {
        countryCode: 'US',
        countryName: 'United States',
        ip: '',
        detected: false,
        error: error?.message || 'Unknown error',
      },
      { status: 200 } // Return 200 with default values instead of error
    );
  }
}

