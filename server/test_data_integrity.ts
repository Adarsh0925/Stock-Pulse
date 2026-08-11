import fetch from 'node-fetch';

async function runIntegrityAudit() {
  console.log("==================================================");
  console.log("  STOCKPULSE CANONICAL DATA INTEGRITY AUDIT SUITE ");
  console.log("==================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       Detail: ${detail}`);
    }
  }

  const BASE_URL = 'http://localhost:3000';
  const symbolsToAudit = [
    'HDFCBANK.NS', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'BHARTIARTL.NS',
    'ICICIBANK.NS', 'SBIN.NS', 'NVDA', 'AAPL', 'TSLA'
  ];

  try {
    // 1. Fetch Stock Screener
    const screenerRes = await fetch(`${BASE_URL}/api/screener`);
    assert(screenerRes.ok, "API /api/screener returns HTTP 200");
    const screenerData: any[] = await screenerRes.json();

    // 2. Audit Every Symbol across Research, Screener, and Audit endpoints
    for (const symbol of symbolsToAudit) {
      console.log(`\n--- Auditing ${symbol} ---`);
      
      const researchRes = await fetch(`${BASE_URL}/api/company/${symbol}/research`);
      assert(researchRes.ok, `[${symbol}] Research endpoint returns HTTP 200`);
      if (!researchRes.ok) continue;
      
      const researchData = await researchRes.json();
      const screenerItem = screenerData.find((s: any) => s.ticker === symbol);
      
      assert(!!screenerItem, `[${symbol}] Present in Screener payload`);

      // Price Consistency Check
      const researchPrice = researchData.quote?.current_price;
      const screenerPrice = screenerItem?.priceNum;

      if (researchPrice !== null && screenerPrice !== undefined) {
        assert(
          researchPrice === screenerPrice,
          `[${symbol}] Canonical Price Synchronization Across Research and Screener`,
          `Research=${researchPrice}, Screener=${screenerPrice}`
        );
      }

      // Source Label Terminology Check
      const dataSource = researchData.quote?.data_source;
      const isValidSourceLabel = ['SINGLE SOURCE', 'MULTI-SOURCE VERIFIED', 'MULTI-SOURCE CONSENSUS', 'SOURCE CONFLICT', 'SOURCE DISAGREEMENT', 'DATA UNAVAILABLE'].includes(dataSource);
      assert(
        isValidSourceLabel,
        `[${symbol}] Source Label is non-contradictory ('${dataSource}')`,
        `Label must be SINGLE SOURCE, MULTI-SOURCE VERIFIED, SOURCE CONFLICT, or DATA UNAVAILABLE`
      );

      // Price Change Math Check
      const prevClose = researchData.quote?.previous_close;
      if (researchPrice && prevClose) {
        const expectedDiff = Number((researchPrice - prevClose).toFixed(2));
        const expectedPct = Number(((expectedDiff / prevClose) * 100).toFixed(2));
        const actualPct = researchData.quote?.change_percent;

        assert(
          Math.abs(expectedPct - actualPct) < 0.1,
          `[${symbol}] Change % Math Consistency`,
          `Expected ${expectedPct}%, Got ${actualPct}%`
        );
      }

      // ML Confidence & Reliability Check
      const ml = researchData.ml;
      if (ml && ml.status === 'SUCCESS') {
        const isReliable = ml.is_reliable;
        const confidenceStatus = ml.confidence_status;
        const mlComponent = researchData.score_components?.find((c: any) => c.category === 'Machine Learning Probability');

        const shouldBeReliable = ml.test_sample_count >= 10 && ml.accuracy >= 50.0 && ml.f1_score >= 50.0 && ml.precision > 0 && ml.recall > 0;

        if (!shouldBeReliable) {
          assert(
            !isReliable && confidenceStatus === 'LOW CONFIDENCE',
            `[${symbol}] Unreliable ML correctly tagged LOW CONFIDENCE`,
            `Test Accuracy=${ml.accuracy}%, F1=${ml.f1_score}%`
          );
          assert(
            mlComponent?.weight === 0,
            `[${symbol}] Low confidence ML weight excluded (0%) from Research Score`,
            `Weight=${mlComponent?.weight}`
          );
        } else {
          assert(
            isReliable && ['HIGH', 'MEDIUM'].includes(confidenceStatus),
            `[${symbol}] Reliable ML tagged HIGH or MEDIUM confidence`,
            `Test Accuracy=${ml.accuracy}%, F1=${ml.f1_score}%`
          );
          assert(
            mlComponent?.weight === 0.2,
            `[${symbol}] Reliable ML weight included (20%) in Research Score`,
            `Weight=${mlComponent?.weight}`
          );
        }
      }

      // Score Breakdown Math Verification
      const scoreComponents = researchData.score_components;
      if (scoreComponents && Array.isArray(scoreComponents)) {
        const weightSum = scoreComponents.reduce((acc: number, c: any) => acc + c.weight, 0);
        const scoreSum = scoreComponents.reduce((acc: number, c: any) => acc + c.weighted_score, 0);
        const finalScore = researchData.final_research_score;

        assert(
          Math.abs(weightSum - 1.0) < 0.01,
          `[${symbol}] Active Research Score Weights sum to 1.0 (100%)`,
          `Sum of active weights=${weightSum}`
        );

        if (finalScore !== null) {
          assert(
            Math.abs(scoreSum - finalScore) < 0.1,
            `[${symbol}] Score Mathematics Verification (Sum of weighted factors == Final Score)`,
            `Sum=${scoreSum.toFixed(2)}, FinalScore=${finalScore}`
          );
        }
      }

      // Technical Calculation Period Label Check
      const techPeriod = researchData.technical?.calculation_period;
      assert(
        techPeriod === '1Y Daily Verified Candles',
        `[${symbol}] Technical analysis period correctly labeled`,
        `Period=${techPeriod}`
      );
    }

    // 3. Dynamic Variation Test Across Tickers
    const distinctPrices = new Set(screenerData.map((s: any) => s.priceNum));
    assert(
      distinctPrices.size > 1,
      "Screener prices vary dynamically across all tickers (Zero mock/static prices)"
    );

  } catch (err: any) {
    console.error("Audit Execution Error:", err.message);
  }

  console.log("\n==================================================");
  console.log(`AUDIT RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log("==================================================\n");

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runIntegrityAudit();
