import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { carQueryService } from '@/lib/services/carquery-api';
import { manufacturerScraperService } from '@/lib/services/manufacturer-scrapers';
import { marketScraperService } from '@/lib/scrapers/market-scrapers';
import type {
  SPASearchParams,
  SPASearchResponse,
  ComprehensiveSPAData,
  SPAError,
} from '@/types/spa';

export async function POST(request: NextRequest) {
  const params = (await request.json()) as SPASearchParams;
  const { make, model, year, dataSource } = params;
  const start = Date.now();

  if (!make || !model) {
    const resp: SPASearchResponse = {
      success: false,
      error: { code: 'INVALID_PARAMS', message: 'make and model required' },
      meta: {
        searchQuery: params,
        executionTime: 0,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    return NextResponse.json(resp, { status: 400 });
  }

  const result: Partial<ComprehensiveSPAData> = {
    make,
    model,
    year: year ?? new Date().getFullYear(),
    dataSource,
    timestamp: new Date().toISOString(),
    dataSources: {
      database: dataSource === 'database' || dataSource === 'comprehensive',
      carQuery: dataSource === 'carquery' || dataSource === 'comprehensive',
      manufacturer:
        dataSource === 'manufacturer' || dataSource === 'comprehensive',
      market: dataSource === 'market' || dataSource === 'comprehensive',
    },
    searchQuery: params,
  };

  // 1️⃣ CarQuery
  if (result.dataSources.carQuery) {
    const trims = await carQueryService.getTrims(
      make,
      model,
      year?.toString()
    );
    const chosen =
      trims.find((t) => t.model_year === String(year)) ?? trims[0];
    if (chosen) {
      result.basicSpecifications = {
        make: chosen.model_make_display,
        model: chosen.model_name,
        year: parseInt(chosen.model_year, 10),
        bodyType: chosen.model_body,
        engine: chosen.model_engine_type,
        doors: parseInt(chosen.model_doors, 10),
        seats: parseInt(chosen.model_seats, 10),
        drivetrain: chosen.model_drive,
        transmission: chosen.model_transmission_type,
      };
      result.performanceData = {
        engine: chosen.model_engine_cc,
        horsePower: `${chosen.model_engine_power_ps} PS`,
        torque: `${chosen.model_engine_torque_nm} Nm`,
        acceleration060: `${chosen.model_0_to_100_kph} s`,
        topSpeed: `${chosen.model_top_speed_kph} kph`,
        transmission: chosen.model_transmission_type,
        driveType: chosen.model_drive,
        weight: `${chosen.model_weight_kg} kg`,
      };
    }
  }

  // 2️⃣ Manufacturer
  if (result.dataSources.manufacturer) {
    try {
      result.manufacturerData = await manufacturerScraperService.scrapeManufacturerData(
        make,
        model,
        year
      );
    } catch {
      /* ignore */
    }
  }

  // 3️⃣ Live market
  if (result.dataSources.market) {
    const mkt = await marketScraperService.scrapeAll(make, model, year);
    if (mkt.success && mkt.data) {
      result.marketData = mkt.data[0];
    }
  }

  // 4️⃣ DB fallback
  if (result.dataSources.database) {
    const db = await prisma.buyCar.findFirst({
      where: { make, model, year },
      select: {
        price: true,
        specifications: true,
        features: true,
        standardEquipment: true,
        addedOptions: true,
      },
    });
    if (db) {
      result.pricingData = {
        baseMSRP: db.price,
        currentMarketRange: '',
        averageDealerPrice: db.price,
        dealerInventoryCount: 1,
        priceTrend: '',
      };
      result.basicSpecifications = db.specifications as any;
      result.popularOptions = db.addedOptions?.map((n) => ({
        name: n,
        frequency: 1,
        source: 'database',
      }));
    }
  }

  const response: SPASearchResponse = {
    success: true,
    data: result as ComprehensiveSPAData,
    meta: {
      searchQuery: params,
      executionTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };
  return NextResponse.json(response);
}