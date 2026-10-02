#!/usr/bin/env npx ts-node
/**
 * Appends current run metrics to data/trends.json for historical tracking.
 * Keeps only the last 30 entries. Run after metrics: npm run metrics && npm run trends
 */

import * as fs from 'fs';
import * as path from 'path';
import { computeMetrics } from './generate-metrics';
import { getApiCoverage } from './api-coverage';

const TRENDS_FILE = path.join(process.cwd(), 'data', 'trends.json');
const MAX_ENTRIES = 30;

export interface TrendEntry {
  timestamp: string;
  successRate: number;
  flakyCount: number;
  totalTests: number;
  duration: number;
  apiCoverage: number;
}

function updateTrends(): void {
  const metrics = computeMetrics();
  if (!metrics) {
    console.error('Skipping trends update: no test results.');
    process.exit(1);
  }

  if (metrics.totalTests === 0) {
    console.log('\n⏭️  Skipping trends update: no tests in this run\n');

    return;
  }

  const dataDir = path.dirname(TRENDS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let trends: TrendEntry[] = [];
  if (fs.existsSync(TRENDS_FILE)) {
    const raw = fs.readFileSync(TRENDS_FILE, 'utf-8');
    try {
      trends = JSON.parse(raw);
    } catch {
      trends = [];
    }
  }

  const entry: TrendEntry = {
    timestamp: new Date().toISOString(),
    successRate: metrics.successRate,
    flakyCount: metrics.flakyCount,
    totalTests: metrics.totalTests,
    duration: metrics.duration,
    apiCoverage: parseFloat(getApiCoverage()),
  };

  trends.push(entry);
  if (trends.length > MAX_ENTRIES) {
    trends = trends.slice(-MAX_ENTRIES);
  }

  fs.writeFileSync(TRENDS_FILE, JSON.stringify(trends, null, 2), 'utf-8');
  console.log(`\n📈 Trends updated: ${TRENDS_FILE} (${trends.length} entries)\n`);
}

if (require.main === module) {
  updateTrends();
}
