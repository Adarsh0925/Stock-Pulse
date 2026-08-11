import { SourceProvenance } from './types';

export interface ProviderQuote {
  providerName: string;
  price: number | null;
  status: 'valid' | 'failed' | 'invalid';
  provenance: SourceProvenance;
}

export interface AggregatedConsensus {
  consensusStatus: 'MULTI-SOURCE VERIFIED' | 'SINGLE SOURCE' | 'SOURCE CONFLICT' | 'DATA UNAVAILABLE';
  aggregatedPrice: number | null;
  validProvidersCount: number;
  matchingProvidersCount: number;
  totalProviders: number;
  tolerancePct: number;
  explanation: string;
}

export class SourceConsensus {
  private tolerancePct: number;
  private minRequiredMatches: number;

  constructor(tolerancePct: number = 2.0, minRequiredMatches: number = 2) {
    this.tolerancePct = tolerancePct;
    this.minRequiredMatches = minRequiredMatches;
  }

  public aggregate(providers: ProviderQuote[]): AggregatedConsensus {
    const totalProviders = providers.length;
    const validProviders = providers.filter(
      p => p.status === 'valid' && typeof p.price === 'number' && !isNaN(p.price) && p.price > 0
    );

    if (validProviders.length === 0) {
      return {
        consensusStatus: 'DATA UNAVAILABLE',
        aggregatedPrice: null,
        validProvidersCount: 0,
        matchingProvidersCount: 0,
        totalProviders,
        tolerancePct: this.tolerancePct,
        explanation: 'Zero valid market data providers responded with live/historical prices.'
      };
    }

    if (validProviders.length === 1) {
      return {
        consensusStatus: 'SINGLE SOURCE',
        aggregatedPrice: validProviders[0].price,
        validProvidersCount: 1,
        matchingProvidersCount: 1,
        totalProviders,
        tolerancePct: this.tolerancePct,
        explanation: `Only single provider (${validProviders[0].providerName}) available. Minimum ${this.minRequiredMatches} matching providers required for multi-source verification.`
      };
    }

    // Find largest group of matching providers within tolerance
    let maxMatchingGroup: ProviderQuote[] = [];

    for (let i = 0; i < validProviders.length; i++) {
      const candidateGroup: ProviderQuote[] = [validProviders[i]];
      const basePrice = validProviders[i].price!;

      for (let j = 0; j < validProviders.length; j++) {
        if (i === j) continue;
        const compPrice = validProviders[j].price!;
        const variancePct = (Math.abs(basePrice - compPrice) / basePrice) * 100;

        if (variancePct <= this.tolerancePct) {
          candidateGroup.push(validProviders[j]);
        }
      }

      if (candidateGroup.length > maxMatchingGroup.length) {
        maxMatchingGroup = candidateGroup;
      }
    }

    const matchCount = maxMatchingGroup.length;

    if (matchCount >= this.minRequiredMatches || (validProviders.length >= 2 && matchCount === validProviders.length)) {
      const sum = maxMatchingGroup.reduce((acc, curr) => acc + curr.price!, 0);
      const avgPrice = Number((sum / matchCount).toFixed(2));

      return {
        consensusStatus: 'MULTI-SOURCE VERIFIED',
        aggregatedPrice: avgPrice,
        validProvidersCount: validProviders.length,
        matchingProvidersCount: matchCount,
        totalProviders,
        tolerancePct: this.tolerancePct,
        explanation: `Multi-source verified: ${matchCount} of ${totalProviders} independent market providers matched within ${this.tolerancePct}% tolerance.`
      };
    }

    // Disagreement beyond tolerance
    const fallbackPrice = validProviders[0].price!;
    return {
      consensusStatus: 'SOURCE CONFLICT',
      aggregatedPrice: fallbackPrice,
      validProvidersCount: validProviders.length,
      matchingProvidersCount: matchCount,
      totalProviders,
      tolerancePct: this.tolerancePct,
      explanation: `Source conflict: Only ${matchCount} of ${totalProviders} providers matched within ${this.tolerancePct}% tolerance threshold.`
    };
  }
}
