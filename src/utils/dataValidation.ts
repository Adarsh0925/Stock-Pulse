/**
 * NIFTY 50 Historical Market Data & Sentiment Validation Utilities
 * 
 * Provides rigorous validation rules for time-series equity datasets:
 * 1. Monotonic chronological date ordering (t_0 < t_1 < ... < t_n)
 * 2. Strict non-future date bounds (Date <= Today)
 * 3. Exact Price-Date alignment & step return consistency
 * 4. Index price sanity boundaries (15,000 <= NIFTY_Close <= 35,000)
 * 5. Deduplication and invalid record handling
 */

export interface ValidationRecord {
  date: string;
  nifty_close: number;
  nifty_change_pct?: number;
  headline_count?: number;
  vader_compound?: number;
  sentiment_label?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | string;
  [key: string]: any;
}

export interface ValidationResult {
  isValid: boolean;
  totalRecords: number;
  errors: string[];
  warnings: string[];
  metrics: {
    isChronological: boolean;
    hasNoFutureDates: boolean;
    isPriceDateAligned: boolean;
    isWithinPriceBounds: boolean;
    hasNoDuplicates: boolean;
    earliestDate?: string;
    latestDate?: string;
    priceRange?: { min: number; max: number };
  };
}

/**
 * Checks if a date string is in valid YYYY-MM-DD format.
 */
export function isValidDateFormat(dateStr: string): boolean {
  if (typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().startsWith(dateStr);
}

/**
 * Verifies that records are sorted in strictly ascending chronological order without duplicates.
 */
export function validateChronologicalOrder(records: Array<{ date: string }>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!records || records.length <= 1) {
    return { isValid: true, errors };
  }

  for (let i = 1; i < records.length; i++) {
    const prevDateStr = records[i - 1]?.date;
    const currDateStr = records[i]?.date;

    if (!isValidDateFormat(prevDateStr)) {
      errors.push(`Invalid date format at index ${i - 1}: "${prevDateStr}"`);
      continue;
    }
    if (!isValidDateFormat(currDateStr)) {
      errors.push(`Invalid date format at index ${i}: "${currDateStr}"`);
      continue;
    }

    const prevTime = new Date(prevDateStr + 'T00:00:00Z').getTime();
    const currTime = new Date(currDateStr + 'T00:00:00Z').getTime();

    if (currTime < prevTime) {
      errors.push(
        `Chronological violation at index ${i}: Date "${currDateStr}" appears after "${prevDateStr}" (out of order)`
      );
    } else if (currTime === prevTime) {
      errors.push(
        `Duplicate date detected at index ${i}: Duplicate "${currDateStr}"`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Verifies that no record contains a future date relative to a reference date (default: today).
 */
export function validateNoFutureDates(
  records: Array<{ date: string }>,
  referenceDate: Date = new Date()
): {
  isValid: boolean;
  futureDates: string[];
  errors: string[];
} {
  const futureDates: string[] = [];
  const errors: string[] = [];

  // Use UTC or local end of day to avoid timezone skew
  const todayYMD = referenceDate.toISOString().split('T')[0];
  const maxAllowedTime = new Date(todayYMD + 'T23:59:59.999Z').getTime();

  for (let i = 0; i < records.length; i++) {
    const dateStr = records[i]?.date;
    if (!isValidDateFormat(dateStr)) {
      errors.push(`Invalid date format at index ${i}: "${dateStr}"`);
      continue;
    }

    const recordTime = new Date(dateStr + 'T00:00:00Z').getTime();
    if (recordTime > maxAllowedTime) {
      futureDates.push(dateStr);
      errors.push(
        `Future date detected at index ${i}: "${dateStr}" is in the future relative to "${todayYMD}"`
      );
    }
  }

  return {
    isValid: futureDates.length === 0 && errors.length === 0,
    futureDates,
    errors
  };
}

/**
 * Verifies that price-date pairs remain aligned, prices are valid numbers within realistic index boundaries,
 * and percentage change calculations match the step returns across consecutive sessions.
 */
export function validatePriceDateAlignment(
  records: ValidationRecord[],
  options: { minPrice?: number; maxPrice?: number; tolerancePct?: number } = {}
): {
  isValid: boolean;
  errors: string[];
  mismatches: Array<{ index: number; date: string; reason: string }>;
} {
  const { minPrice = 15000, maxPrice = 35000, tolerancePct = 0.1 } = options;
  const errors: string[] = [];
  const mismatches: Array<{ index: number; date: string; reason: string }> = [];

  if (!records || records.length === 0) {
    return { isValid: true, errors: [], mismatches: [] };
  }

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const date = rec?.date;
    const price = rec?.nifty_close;

    // 1. Price existence and type check
    if (typeof price !== 'number' || isNaN(price) || !isFinite(price)) {
      const reason = `Non-numeric or NaN price for date "${date}": ${price}`;
      errors.push(reason);
      mismatches.push({ index: i, date, reason });
      continue;
    }

    // 2. Realistic NIFTY 50 index bounds check
    if (price < minPrice || price > maxPrice) {
      const reason = `Price ₹${price} on "${date}" is outside realistic NIFTY 50 index bounds (₹${minPrice} - ₹${maxPrice})`;
      errors.push(reason);
      mismatches.push({ index: i, date, reason });
    }

    // 3. Step return / percentage change alignment with previous session
    if (i > 0 && typeof rec.nifty_change_pct === 'number') {
      const prevPrice = records[i - 1].nifty_close;
      if (typeof prevPrice === 'number' && prevPrice > 0) {
        const expectedChangePct = Number((((price - prevPrice) / prevPrice) * 100).toFixed(2));
        const actualChangePct = Number(rec.nifty_change_pct.toFixed(2));
        const diff = Math.abs(expectedChangePct - actualChangePct);

        if (diff > tolerancePct) {
          const reason = `Percentage change mismatch on "${date}": Reported ${actualChangePct}%, but calculated from previous close ₹${prevPrice} to ₹${price} is ${expectedChangePct}% (diff: ${diff.toFixed(2)}%)`;
          errors.push(reason);
          mismatches.push({ index: i, date, reason });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    mismatches
  };
}

/**
 * Master validation suite running all checks on a NIFTY 50 dataset.
 */
export function validateNiftyHistoricalData(
  records: ValidationRecord[],
  options: {
    referenceDate?: Date;
    minPrice?: number;
    maxPrice?: number;
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(records) || records.length === 0) {
    return {
      isValid: false,
      totalRecords: 0,
      errors: ['Dataset is empty or not an array'],
      warnings: [],
      metrics: {
        isChronological: false,
        hasNoFutureDates: false,
        isPriceDateAligned: false,
        isWithinPriceBounds: false,
        hasNoDuplicates: false
      }
    };
  }

  const chronoCheck = validateChronologicalOrder(records);
  if (!chronoCheck.isValid) {
    errors.push(...chronoCheck.errors);
  }

  const futureCheck = validateNoFutureDates(records, options.referenceDate);
  if (!futureCheck.isValid) {
    errors.push(...futureCheck.errors);
  }

  const alignmentCheck = validatePriceDateAlignment(records, {
    minPrice: options.minPrice,
    maxPrice: options.maxPrice
  });
  if (!alignmentCheck.isValid) {
    errors.push(...alignmentCheck.errors);
  }

  const prices = records.map(r => r.nifty_close).filter(p => typeof p === 'number' && !isNaN(p));
  const minPriceFound = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPriceFound = prices.length > 0 ? Math.max(...prices) : 0;

  const hasNoDuplicates = !chronoCheck.errors.some(e => e.includes('Duplicate'));

  return {
    isValid: errors.length === 0,
    totalRecords: records.length,
    errors,
    warnings,
    metrics: {
      isChronological: chronoCheck.isValid,
      hasNoFutureDates: futureCheck.isValid,
      isPriceDateAligned: alignmentCheck.isValid,
      isWithinPriceBounds: minPriceFound >= (options.minPrice || 15000) && maxPriceFound <= (options.maxPrice || 35000),
      hasNoDuplicates,
      earliestDate: records[0]?.date,
      latestDate: records[records.length - 1]?.date,
      priceRange: { min: minPriceFound, max: maxPriceFound }
    }
  };
}

/**
 * Sanitizes, deduplicates, filters outliers/future dates, and sorts raw historical data into a clean pipeline.
 */
export function sanitizeAndAlignNiftyDataset(
  rawRecords: any[],
  options: { referenceDate?: Date; minPrice?: number; maxPrice?: number } = {}
): ValidationRecord[] {
  if (!Array.isArray(rawRecords)) return [];

  const {
    referenceDate = new Date(),
    minPrice = 15000,
    maxPrice = 35000
  } = options;

  const todayYMD = referenceDate.toISOString().split('T')[0];
  const maxAllowedTime = new Date(todayYMD + 'T23:59:59.999Z').getTime();

  const validMap = new Map<string, ValidationRecord>();

  for (const item of rawRecords) {
    if (!item || typeof item !== 'object') continue;
    const dateStr = item.date;
    const closePrice = Number(item.nifty_close);

    if (!isValidDateFormat(dateStr)) continue;
    if (isNaN(closePrice) || closePrice < minPrice || closePrice > maxPrice) continue;

    const recordTime = new Date(dateStr + 'T00:00:00Z').getTime();
    if (recordTime > maxAllowedTime) continue; // Drop future dates

    validMap.set(dateStr, {
      ...item,
      date: dateStr,
      nifty_close: Number(closePrice.toFixed(2)),
      nifty_change_pct: typeof item.nifty_change_pct === 'number' ? Number(item.nifty_change_pct.toFixed(2)) : 0
    });
  }

  // Sort strictly ascending chronologically
  const sorted = Array.from(validMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Recalculate percentage changes to guarantee exact price-date mathematical alignment
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      sorted[i].nifty_change_pct = sorted[i].nifty_change_pct || 0;
    } else {
      const prev = sorted[i - 1].nifty_close;
      const curr = sorted[i].nifty_close;
      sorted[i].nifty_change_pct = Number((((curr - prev) / prev) * 100).toFixed(2));
    }
  }

  return sorted;
}
