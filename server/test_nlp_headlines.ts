import { analyzeCustomHeadline } from './services/newsNlp';

console.log('==================================================');
console.log('         STOCKPULSE GLOBAL NLP AUDIT SUITE        ');
console.log('==================================================\n');

let passCount = 0;
let failCount = 0;

function assertTest(testName: string, passed: boolean, details: string) {
  if (passed) {
    passCount++;
    console.log(`[PASS] ${testName}: ${details}`);
  } else {
    failCount++;
    console.log(`[FAIL] ${testName}: ${details}`);
  }
}

// Test Case 1: Strong positive financial headline
const h1 = analyzeCustomHeadline("TCS reports strong quarterly profit growth and raises its revenue outlook.");
assertTest(
  '1. Positive Headline',
  h1.sentiment === 'BULLISH' && h1.vader_score > 0,
  `Sentiment=${h1.sentiment}, VADER=+${h1.vader_score}, PosCatalysts=[${h1.matched_positive_words.join(', ')}]`
);

// Test Case 2: Strong negative financial headline
const h2 = analyzeCustomHeadline("HDFC Bank shares fall after weak loan growth raises investor concerns.");
assertTest(
  '2. Negative Headline',
  h2.sentiment === 'BEARISH' && h2.vader_score < 0,
  `Sentiment=${h2.sentiment}, VADER=${h2.vader_score}, RiskFactors=[${h2.matched_negative_words.join(', ')}]`
);

// Test Case 3: Neutral financial headline
const h3 = analyzeCustomHeadline("Infosys announces quarterly results in line with analyst expectations.");
assertTest(
  '3. Neutral Headline',
  h3.sentiment === 'NEUTRAL',
  `Sentiment=${h3.sentiment}, VADER=${h3.vader_score}`
);

// Test Case 4: Negated no major change
const h4 = analyzeCustomHeadline("Company reports no major change in its financial outlook.");
assertTest(
  '4. Negated Neutral Headline',
  h4.sentiment === 'NEUTRAL',
  `Sentiment=${h4.sentiment}, VADER=${h4.vader_score}`
);

// Test Case 5: "debt down" / "decline" used positively
const h5 = analyzeCustomHeadline("Debt declined 15% as the company improved its balance sheet.");
assertTest(
  '5. Debt Declined (Positive Context)',
  (h5.sentiment === 'BULLISH' || h5.vader_score > 0) && h5.matched_positive_words.some(w => w.includes('decline')),
  `Sentiment=${h5.sentiment}, VADER=+${h5.vader_score}, PosCatalysts=[${h5.matched_positive_words.join(', ')}]`
);

// Test Case 6: "Shares decline" (Negative Context)
const h6 = analyzeCustomHeadline("Shares decline 2% after disappointing earnings.");
assertTest(
  '6. Shares Decline (Negative Context)',
  h6.sentiment === 'BEARISH' && h6.vader_score < 0,
  `Sentiment=${h6.sentiment}, VADER=${h6.vader_score}, RiskFactors=[${h6.matched_negative_words.join(', ')}]`
);

// Test Case 7: "default" used in financial context
const h7 = analyzeCustomHeadline("Bond default warning issued after company misses interest payment.");
assertTest(
  '7. Financial Debt Default',
  h7.sentiment === 'BEARISH' && h7.matched_negative_words.some(w => w.includes('default')),
  `Sentiment=${h7.sentiment}, VADER=${h7.vader_score}, RiskFactors=[${h7.matched_negative_words.join(', ')}]`
);

// Test Case 8: "default" used as technical/programming text
const h8 = analyzeCustomHeadline("BEARISH VADER Score: -0.95 Matched keyword: default Risk Factors: default Negations: not never down no");
assertTest(
  '8. Technical Text with "default" Word',
  h8.sentiment === 'NOT APPLICABLE' || h8.input_type === 'NON_FINANCIAL_TEXT',
  `Sentiment=${h8.sentiment}, InputType=${h8.input_type}, Explanation=${h8.explanation}`
);

// Test Case 9: Long technical/system text prompt
const h9 = analyzeCustomHeadline("Verify that the validator service enforces global data integrity rules across all tickers without hardcoded symbol checks, company-specific exceptions, or mock fallbacks.");
assertTest(
  '9. Long Technical / Non-News Prompt',
  h9.sentiment === 'NOT APPLICABLE' || h9.input_type === 'NON_FINANCIAL_TEXT',
  `Sentiment=${h9.sentiment}, InputType=${h9.input_type}, RiskFactors=[${h9.matched_negative_words.join(', ')}]`
);

console.log('\n==================================================');
console.log(`AUDIT RESULTS: ${passCount} PASSED / ${passCount + failCount} TOTAL`);
console.log('==================================================');

if (failCount > 0) {
  process.exit(1);
}
