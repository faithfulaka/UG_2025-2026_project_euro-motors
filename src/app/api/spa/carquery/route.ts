import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services/carquery-api';
import type { SPAServiceResponse, SPAError } from '@/types/spa';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const cmd = url.searchParams.get('cmd');
  const start = Date.now();

  if (!cmd) {
    const resp: SPAServiceResponse<unknown> = {
      success: false,
      error: { code: 'MISSING_CMD', message: 'cmd query parameter is required' },
      processingTime: 0,
      cached: false,
    };
    return NextResponse.json(resp, { status: 400 });
  }

  try {
    let data: unknown;
    switch (cmd) {
      case 'getMakes':
        data = await carQueryService.getMakes();
        break;
      case 'getModels':
        {
          const make = url.searchParams.get('make');
          if (!make) {
            throw new Error('make is required for getModels');
          }
          data = await carQueryService.getModels(make);
        }
        break;
      case 'getTrims':
        {
          const make = url.searchParams.get('make');
          const model = url.searchParams.get('model');
          if (!make || !model) {
            throw new Error('make and model are required for getTrims');
          }
          const year = url.searchParams.get('year') ?? undefined;
          data = await carQueryService.getTrims(make, model, year);
        }
        break;
      default:
        throw new Error(`Unknown cmd "${cmd}"`);
    }

    const resp: SPAServiceResponse<unknown> = {
      success: true,
      data,
      processingTime: Date.now() - start,
      cached: false,
    };
    return NextResponse.json(resp);
  } catch (err: unknown) {
    const error: SPAError = {
      code: 'CARQUERY_ERROR',
      message: err instanceof Error ? err.message : String(err),
    };
    const resp: SPAServiceResponse<unknown> = {
      success: false,
      error,
      processingTime: Date.now() - start,
      cached: false,
    };
    return NextResponse.json(resp, { status: 500 });
  }
}