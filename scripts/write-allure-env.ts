#!/usr/bin/env npx ts-node
/**
 * Prepares allure-results for report generation:
 * - environment.properties (Environment widget)
 * - executor.json (Executor block, report name, trends buildOrder)
 * - categories.json (defect categories for Overview)
 * - history/ (copied from previous run for trends)
 * Run before allure generate.
 */

import * as fs from 'fs';
import * as path from 'path';
import { computeMetrics } from './generate-metrics';
import { getApiCoverage } from './api-coverage';

const ALLURE_RESULTS = path.join(process.cwd(), 'allure-results');
const ALLURE_HISTORY = path.join(process.cwd(), 'allure-history');
const ENV_FILE = path.join(ALLURE_RESULTS, 'environment.properties');
const EXECUTOR_FILE = path.join(ALLURE_RESULTS, 'executor.json');
const CATEGORIES_FILE = path.join(ALLURE_RESULTS, 'categories.json');

const HISTORY_FILES = [
  'history.json',
  'history-trend.json',
  'categories-trend.json',
  'duration-trend.json',
  'retry-trend.json',
];

const FAILED_STATUSES = new Set(['failed', 'broken']);

interface AllureStatusDetails {
  message?: string;
  trace?: string;
}

interface AllureStep {
  status?: string;
  statusDetails?: AllureStatusDetails;
  steps?: AllureStep[];
}

interface AllureResult {
  status?: string;
  statusDetails?: AllureStatusDetails;
  steps?: AllureStep[];
}

function ensureAllureResults(): void {
  if (!fs.existsSync(ALLURE_RESULTS)) {
    fs.mkdirSync(ALLURE_RESULTS, { recursive: true });
  }
}

function findDeepestFailure(steps: AllureStep[] | undefined): AllureStatusDetails | undefined {
  let found: AllureStatusDetails | undefined;

  for (const step of steps ?? []) {
    const nested = findDeepestFailure(step.steps);
    if (nested?.message) {
      found = nested;
      continue;
    }

    if (step.status && FAILED_STATUSES.has(step.status) && step.statusDetails?.message) {
      found = step.statusDetails;
    }
  }

  return found;
}

/**
 * Playwright records a timeout as the test message and keeps the locator call log on a nested step.
 * Allure's overview only renders the test message, so copy the deeper error up.
 */
function promoteStepFailures(): void {
  const files = fs.readdirSync(ALLURE_RESULTS).filter((file) => file.endsWith('-result.json'));
  let promoted = 0;

  for (const file of files) {
    const fullPath = path.join(ALLURE_RESULTS, file);
    let result: AllureResult;
    try {
      result = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as AllureResult;
    } catch {
      continue;
    }

    if (!result.status || !FAILED_STATUSES.has(result.status)) {
      continue;
    }

    const detailed = findDeepestFailure(result.steps);
    const current = result.statusDetails?.message ?? '';
    const next = detailed?.message ?? '';
    if (!next || next.length <= current.length) {
      continue;
    }

    result.statusDetails = {
      message: next,
      trace: detailed?.trace || next,
    };
    fs.writeFileSync(fullPath, JSON.stringify(result), 'utf-8');
    promoted++;
  }

  if (promoted > 0) {
    console.log(`  📎 Promoted step errors onto ${promoted} Allure result(s)`);
  }
}

function writeEnvironmentProperties(): void {
  const metrics = computeMetrics(true);
  const apiCoverage = getApiCoverage();

  const lines: string[] = [
    `Run_Environment=${process.env.CI ? 'GitHub Actions' : 'Local Developer Machine'}`,
    `API_Coverage=${apiCoverage}%`,
    `Success_Rate=${metrics ? `${metrics.successRate}%` : 'N/A'}`,
    `Flaky_Tests=${metrics?.flakyCount ?? 0}`,
    `Trends_Chart=trends-chart.html`,
  ];

  fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n', 'utf-8');
}

function writeExecutorJson(): void {
  const repo = process.env.GITHUB_REPOSITORY ?? 'automation-exercise';
  const runId = process.env.GITHUB_RUN_ID ?? 'local';
  const buildOrder = process.env.GITHUB_RUN_NUMBER
    ? parseInt(process.env.GITHUB_RUN_NUMBER, 10)
    : Math.floor(Date.now() / 1000);
  const baseUrl = `https://${repo.split('/')[0]}.github.io/${repo.split('/')[1] || 'automation-exercise'}`;

  const executor: Record<string, string | number> = process.env.CI
    ? {
        reportName: `Build #${runId}`,
        buildOrder,
        reportUrl: `${baseUrl}/allure.html`,
        buildName: `Playwright Tests #${runId}`,
        buildUrl: `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${repo}/actions/runs/${runId}`,
        type: 'github',
        name: 'GitHub Actions',
      }
    : {
        reportName: `Local Run ${new Date().toISOString().slice(0, 19)}`,
        buildOrder,
        reportUrl: '',
        buildName: `Local ${process.env.USER ?? 'developer'}`,
        buildUrl: '',
        type: 'github',
        name: 'Local',
      };

  fs.writeFileSync(EXECUTOR_FILE, JSON.stringify(executor, null, 2), 'utf-8');
}

function writeCategoriesJson(): void {
  const categories = [
    {
      name: 'Product defects',
      matchedStatuses: ['failed'],
      messageRegex: '.*',
    },
    {
      name: 'Test defects',
      matchedStatuses: ['broken'],
      messageRegex: '.*',
    },
    {
      name: 'Flaky tests',
      matchedStatuses: ['passed', 'failed', 'broken'],
      flaky: true,
    },
    {
      name: 'Skipped tests',
      matchedStatuses: ['skipped'],
      messageRegex: '.*',
    },
  ];
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
}

function copyHistoryFromPreviousRun(): void {
  const historyDir = path.join(ALLURE_RESULTS, 'history');
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

  // Local: copy from allure-history (persisted from last report)
  const sourceDir = process.env.CI ? null : ALLURE_HISTORY;
  if (sourceDir && fs.existsSync(sourceDir)) {
    for (const f of HISTORY_FILES) {
      const src = path.join(sourceDir, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(historyDir, f));
      }
    }
    console.log('  📂 History copied from allure-history/');
  }
  // CI: history is fetched by workflow into allure-results/history before this script
}

function main(): void {
  ensureAllureResults();
  promoteStepFailures();
  writeEnvironmentProperties();
  writeExecutorJson();
  writeCategoriesJson();
  copyHistoryFromPreviousRun();
  console.log(`\n📋 Allure env, executor, categories written to ${ALLURE_RESULTS}\n`);
}

main();
