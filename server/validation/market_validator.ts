/**
 * Unified Market Validator Module
 * Enforces strict 5-compulsory-source consensus verification across independent financial data sources.
 * Requires AT LEAST 4 OUT OF 5 SOURCES TO MATCH within tolerance before output is validated.
 */

export interface ValidationResult {
  consensusStatus: 'MULTI-SOURCE CONSENSUS' | 'SINGLE SOURCE' | 'SOURCE DISAGREEMENT' | 'DATA UNAVAILABLE';
  finalPrice: number | null;
  tolerancePct: number;
  sourcesValidCount: number;
  sourcesMatchedCount: number;
  totalSourcesChecked: number;
  reason: string;
}

export interface QuoteSourceInput {
  name: string;
  price: number | null;
  timestamp?: string;
  status: 'valid' | 'failed';
}

/**
 * Validates quotes across 5 compulsory sources.
 * Requires minimum 4 sources to match within tolerancePct (default 2.0%) for consensus verification.
 */
export function ensureMultiSourceVerified(
  sources: QuoteSourceInput[],
  tolerancePct: number = 2.0,
  minMatchRequired: number = 4
): ValidationResult {
  const totalChecked = sources.length;
  const validSources = sources.filter(s => s.status === 'valid' && typeof s.price === 'number' && !isNaN(s.price) && s.price > 0);

  if (validSources.length === 0) {
    return {
      consensusStatus: 'DATA UNAVAILABLE',
      finalPrice: null,
      tolerancePct,
      sourcesValidCount: 0,
      sourcesMatchedCount: 0,
      totalSourcesChecked: totalChecked,
      reason: 'No financial data sources responded with valid price data.'
    };
  }

  // Find the largest group of valid sources whose prices all agree within tolerancePct of each other
  let maxMatchedGroup: QuoteSourceInput[] = [];

  for (let i = 0; i < validSources.length; i++) {
    const candidateGroup: QuoteSourceInput[] = [validSources[i]];
    const basePrice = validSources[i].price!;

    for (let j = 0; j < validSources.length; j++) {
      if (i === j) continue;
      const comparePrice = validSources[j].price!;
      const diffPct = (Math.abs(basePrice - comparePrice) / basePrice) * 100;

      if (diffPct <= tolerancePct) {
        candidateGroup.push(validSources[j]);
      }
    }

    if (candidateGroup.length > maxMatchedGroup.length) {
      maxMatchedGroup = candidateGroup;
    }
  }

  const matchedCount = maxMatchedGroup.length;

  if (matchedCount >= minMatchRequired) {
    // Compute average price of the matching group
    const sum = maxMatchedGroup.reduce((acc, curr) => acc + curr.price!, 0);
    const avgPrice = Number((sum / matchedCount).toFixed(2));

    return {
      consensusStatus: 'MULTI-SOURCE CONSENSUS',
      finalPrice: avgPrice,
      tolerancePct,
      sourcesValidCount: validSources.length,
      sourcesMatchedCount: matchedCount,
      totalSourcesChecked: totalChecked,
      reason: `Validated: ${matchedCount} of ${totalChecked} compulsory sources matched within ${tolerancePct}% variance threshold.`
    };
  }

  // If 4/5 match condition is not met:
  const fallbackPrice = validSources[0].price!;
  
  if (validSources.length === 1) {
    return {
      consensusStatus: 'SINGLE SOURCE',
      finalPrice: fallbackPrice,
      tolerancePct,
      sourcesValidCount: 1,
      sourcesMatchedCount: 1,
      totalSourcesChecked: totalChecked,
      reason: `Single source available (${validSources[0].name}). Minimum ${minMatchRequired} matching sources required for 5-source consensus verification.`
    };
  }

  return {
    consensusStatus: 'SOURCE DISAGREEMENT',
    finalPrice: fallbackPrice,
    tolerancePct,
    sourcesValidCount: validSources.length,
    sourcesMatchedCount: matchedCount,
    totalSourcesChecked: totalChecked,
    reason: `Consensus failure: Only ${matchedCount} of ${totalChecked} compulsory sources matched within ${tolerancePct}% variance. Minimum ${minMatchRequired} matching sources required.`
  };
}
