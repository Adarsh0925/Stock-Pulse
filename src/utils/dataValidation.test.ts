import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isValidDateFormat,
  validateChronologicalOrder,
  validateNoFutureDates,
  validatePriceDateAlignment,
  validateNiftyHistoricalData,
  sanitizeAndAlignNiftyDataset,
  ValidationRecord
} from './dataValidation';
import { NiftySentimentService } from '../../server/services/niftySentimentService';

describe('NIFTY 50 Historical Data & Validation Test Suite', () => {
  // Reference date anchor (2026-08-14)
  const mockToday = new Date('2026-08-14T12:00:00Z');

  const validSampleData: ValidationRecord[] = [
    { date: '2026-08-01', nifty_close: 24350.50, nifty_change_pct: 0.00, headline_count: 24, vader_compound: 0.35, sentiment_label: 'POSITIVE' },
    { date: '2026-08-04', nifty_close: 24420.75, nifty_change_pct: 0.29, headline_count: 31, vader_compound: 0.42, sentiment_label: 'POSITIVE' },
    { date: '2026-08-05', nifty_close: 24380.20, nifty_change_pct: -0.17, headline_count: 28, vader_compound: -0.12, sentiment_label: 'NEGATIVE' },
    { date: '2026-08-06', nifty_close: 24510.00, nifty_change_pct: 0.53, headline_count: 35, vader_compound: 0.55, sentiment_label: 'POSITIVE' },
    { date: '2026-08-07', nifty_close: 24580.40, nifty_change_pct: 0.29, headline_count: 26, vader_compound: 0.25, sentiment_label: 'POSITIVE' },
    { date: '2026-08-08', nifty_close: 24650.00, nifty_change_pct: 0.28, headline_count: 29, vader_compound: 0.38, sentiment_label: 'POSITIVE' },
    { date: '2026-08-11', nifty_close: 24600.10, nifty_change_pct: -0.20, headline_count: 22, vader_compound: -0.05, sentiment_label: 'NEUTRAL' },
    { date: '2026-08-12', nifty_close: 24720.80, nifty_change_pct: 0.49, headline_count: 34, vader_compound: 0.48, sentiment_label: 'POSITIVE' },
    { date: '2026-08-13', nifty_close: 24690.30, nifty_change_pct: -0.12, headline_count: 27, vader_compound: 0.02, sentiment_label: 'NEUTRAL' },
    { date: '2026-08-14', nifty_close: 24780.00, nifty_change_pct: 0.36, headline_count: 33, vader_compound: 0.51, sentiment_label: 'POSITIVE' }
  ];

  describe('1. Date Format & Chronological Ordering Verification', () => {
    it('should confirm valid ISO YYYY-MM-DD date formats', () => {
      assert.strictEqual(isValidDateFormat('2026-08-14'), true);
      assert.strictEqual(isValidDateFormat('2026-01-01'), true);
      assert.strictEqual(isValidDateFormat('14-08-2026'), false, 'DD-MM-YYYY format should be rejected');
      assert.strictEqual(isValidDateFormat('2026/08/14'), false, 'Slash format should be rejected');
      assert.strictEqual(isValidDateFormat('invalid-date'), false, 'Non-date strings should be rejected');
    });

    it('should validate strictly ascending chronological dates without gaps or inversion', () => {
      const result = validateChronologicalOrder(validSampleData);
      assert.strictEqual(result.isValid, true, 'Valid dataset should pass chronological test');
      assert.strictEqual(result.errors.length, 0);
    });

    it('should detect and fail when dates are out of chronological order', () => {
      const invertedData = [
        { date: '2026-08-01' },
        { date: '2026-08-05' },
        { date: '2026-08-04' } // Out of order: 05 before 04
      ];
      const result = validateChronologicalOrder(invertedData);
      assert.strictEqual(result.isValid, false);
      assert.ok(
        result.errors.some(err => err.includes('Chronological violation')),
        'Should identify chronological violation'
      );
    });

    it('should detect duplicate dates and mark them as invalid', () => {
      const duplicateData = [
        { date: '2026-08-01' },
        { date: '2026-08-04' },
        { date: '2026-08-04' }, // Duplicate date
        { date: '2026-08-05' }
      ];
      const result = validateChronologicalOrder(duplicateData);
      assert.strictEqual(result.isValid, false);
      assert.ok(
        result.errors.some(err => err.includes('Duplicate date detected')),
        'Should identify duplicate date'
      );
    });
  });

  describe('2. Future Date Prevention Verification', () => {
    it('should pass when all dates are on or before the current reference date', () => {
      const result = validateNoFutureDates(validSampleData, mockToday);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.futureDates.length, 0);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should detect and reject dates that occur in the future', () => {
      const dataWithFuture = [
        ...validSampleData,
        { date: '2026-08-15', nifty_close: 24800 }, // Tomorrow (relative to 2026-08-14)
        { date: '2026-09-01', nifty_close: 25000 }  // Next month
      ];
      const result = validateNoFutureDates(dataWithFuture, mockToday);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.futureDates.length, 2);
      assert.ok(result.futureDates.includes('2026-08-15'));
      assert.ok(result.futureDates.includes('2026-09-01'));
      assert.ok(result.errors.some(e => e.includes('Future date detected')));
    });

    it('should strictly allow today as the maximum valid date', () => {
      const todayOnly = [{ date: '2026-08-14' }];
      const result = validateNoFutureDates(todayOnly, mockToday);
      assert.strictEqual(result.isValid, true, "Today's date should be permitted");
    });
  });

  describe('3. Price-Date Pair Alignment & Mathematical Step Returns', () => {
    it('should verify that all price-date pairs are aligned and percentage returns match prices', () => {
      const result = validatePriceDateAlignment(validSampleData);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
      assert.strictEqual(result.mismatches.length, 0);
    });

    it('should detect when percentage change diverges from consecutive session close prices', () => {
      const corruptedReturnsData: ValidationRecord[] = [
        { date: '2026-08-01', nifty_close: 24000.00, nifty_change_pct: 0.00 },
        // Price rose by +4.17% (24000 -> 25000), but change_pct erroneously says -2.50%
        { date: '2026-08-04', nifty_close: 25000.00, nifty_change_pct: -2.50 }
      ];
      const result = validatePriceDateAlignment(corruptedReturnsData);
      assert.strictEqual(result.isValid, false);
      assert.ok(
        result.errors.some(e => e.includes('Percentage change mismatch')),
        'Should flag percentage return mismatch against closing price movement'
      );
    });

    it('should reject non-numeric, NaN, or out-of-range index prices', () => {
      const corruptedPricesData: ValidationRecord[] = [
        { date: '2026-08-01', nifty_close: 24000 },
        { date: '2026-08-04', nifty_close: NaN as any },
        { date: '2026-08-05', nifty_close: 500 } // Below realistic NIFTY 50 index bounds (< 15,000)
      ];
      const result = validatePriceDateAlignment(corruptedPricesData);
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.mismatches.length, 2);
    });
  });

  describe('4. Master NIFTY Historical Dataset Validator', () => {
    it('should perform full multi-factor validation on valid dataset', () => {
      const result = validateNiftyHistoricalData(validSampleData, {
        referenceDate: mockToday,
        minPrice: 20000,
        maxPrice: 30000
      });

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.metrics.isChronological, true);
      assert.strictEqual(result.metrics.hasNoFutureDates, true);
      assert.strictEqual(result.metrics.isPriceDateAligned, true);
      assert.strictEqual(result.metrics.isWithinPriceBounds, true);
      assert.strictEqual(result.metrics.hasNoDuplicates, true);
      assert.strictEqual(result.metrics.earliestDate, '2026-08-01');
      assert.strictEqual(result.metrics.latestDate, '2026-08-14');
      assert.strictEqual(result.metrics.priceRange?.min, 24350.50);
      assert.strictEqual(result.metrics.priceRange?.max, 24780.00);
    });

    it('should sanitize raw un-sanitized data by discarding future dates and recalculating aligned returns', () => {
      const dirtyRawData = [
        { date: '2026-08-05', nifty_close: '24380.20' }, // string number
        { date: '2026-08-01', nifty_close: 24350.50 },   // out of order
        { date: '2026-08-01', nifty_close: 24350.50 },   // duplicate
        { date: '2026-08-20', nifty_close: 25000.00 },   // future date
        { date: '2026-08-04', nifty_close: 24420.75 },   // out of order
        { date: 'invalid-date', nifty_close: 24400.00 }, // invalid date
        { date: '2026-08-06', nifty_close: 50.00 }       // corrupted outlier price
      ];

      const cleanData = sanitizeAndAlignNiftyDataset(dirtyRawData, {
        referenceDate: mockToday,
        minPrice: 15000,
        maxPrice: 35000
      });

      assert.strictEqual(cleanData.length, 3, 'Should keep only the 3 valid historical sessions');
      assert.strictEqual(cleanData[0].date, '2026-08-01');
      assert.strictEqual(cleanData[1].date, '2026-08-04');
      assert.strictEqual(cleanData[2].date, '2026-08-05');

      // Verify mathematical alignment on cleaned data
      const validation = validateNiftyHistoricalData(cleanData, { referenceDate: mockToday });
      assert.strictEqual(validation.isValid, true);
    });
  });

  describe('5. Real Service Pipeline Verification (NiftySentimentService)', () => {
    it('should generate historical sentiment records that are 100% chronological, non-future, and aligned', async () => {
      const records = await NiftySentimentService.getSentimentHistory();

      assert.ok(Array.isArray(records), 'Should return an array of sentiment records');
      assert.ok(records.length >= 20, 'Should contain at least 20 trading sessions');

      const fullValidation = validateNiftyHistoricalData(records);

      assert.strictEqual(
        fullValidation.isValid,
        true,
        `Service output failed validation: ${fullValidation.errors.join('; ')}`
      );
      assert.strictEqual(fullValidation.metrics.isChronological, true);
      assert.strictEqual(fullValidation.metrics.hasNoFutureDates, true);
      assert.strictEqual(fullValidation.metrics.isPriceDateAligned, true);
      assert.strictEqual(fullValidation.metrics.hasNoDuplicates, true);
    });

    it('should maintain chronological continuity and zero future dates across 1W, 1M, and 3M slices', async () => {
      const records = await NiftySentimentService.getSentimentHistory();

      const timeRanges = {
        '1W': records.slice(-5),
        '1M': records.slice(-22),
        'ALL': records
      };

      for (const [rangeKey, slice] of Object.entries(timeRanges)) {
        assert.ok(slice.length > 0, `Slice ${rangeKey} should not be empty`);
        const sliceValidation = validateNiftyHistoricalData(slice);
        assert.strictEqual(
          sliceValidation.isValid,
          true,
          `Slice ${rangeKey} failed validation: ${sliceValidation.errors.join('; ')}`
        );
        // Ensure latest session matches the master latest session
        assert.strictEqual(
          slice[slice.length - 1].date,
          records[records.length - 1].date,
          `Slice ${rangeKey} should end at the latest available session`
        );
      }
    });

    it('should cleanly handle live session enrichment without creating duplicate or future dates', async () => {
      const mockLiveFeed = {
        current_price: 24850.25,
        change_percent: 0.45,
        status: 'LIVE' as const,
        market_status: 'LIVE' as const,
        change: 110.25,
        high_24h: 24900,
        low_24h: 24700,
        open_24h: 24740,
        last_updated: '2026-08-14T09:30:00Z',
        name: 'NIFTY 50'
      };

      const enrichedRecords = await NiftySentimentService.getSentimentHistory(mockLiveFeed as any);
      const validation = validateNiftyHistoricalData(enrichedRecords);

      assert.strictEqual(
        validation.isValid,
        true,
        `Live-enriched dataset failed validation: ${validation.errors.join('; ')}`
      );

      const latestRecord = enrichedRecords[enrichedRecords.length - 1];
      assert.strictEqual(latestRecord.nifty_close, 24850.25, 'Latest record close price must match live quote');
      assert.strictEqual(typeof latestRecord.nifty_change_pct, 'number');
      assert.ok(!isNaN(latestRecord.nifty_change_pct), 'Change percentage must be a valid number');
      assert.strictEqual(latestRecord.is_live, true, 'Live record should have is_live flagged as true');
    });
  });
});
