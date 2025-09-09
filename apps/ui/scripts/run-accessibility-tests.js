#!/usr/bin/env node

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const path = require('path');
const http = require('http');
const https = require('https');
const {
  generateHtmlReport,
  generateJsonReport,
  generateSummaryReport,
  takeScreenshot,
  ensureOutputDirectory
} = require('./accessibility-reporter');

// Import configuration
const config = require('../axe.config.js');

/**
 * Wait for server to be ready
 */
async function waitForServer(url, maxAttempts = 5, interval = 3000) {
  console.log('⏳ Checking server availability...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Use Puppeteer to check if the server is responding
      // This is more reliable than custom HTTP clients
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      await browser.close();
      console.log(`✅ Server is ready at ${url}`);
      return true;

    } catch (error) {
      console.log(`  Attempt ${i + 1}/${maxAttempts}: ${error.message}`);

      if (i < maxAttempts - 1) {
        console.log(`⏳ Waiting ${interval / 1000}s before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  throw new Error(`❌ Server at ${url} is not responding after ${maxAttempts} attempts`);
}

/**
 * Test a single page for accessibility issues
 */
async function testPage(browser, pageConfig, config) {
  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewport(config.viewport);

    // Navigate to the page
    const url = `${config.baseUrl}${pageConfig.url}`;
    console.log(`🔍 Testing page: ${pageConfig.name} (${url})`);

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for additional time if specified
    if (config.waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, config.waitTime));
    }

    // Take screenshot if enabled
    let screenshotPath = null;
    if (config.output.includeScreenshots) {
      screenshotPath = await takeScreenshot(page, pageConfig.name, config.output.directory);
    }

    // Run axe accessibility tests
    console.log(`⚙️  Running axe-core accessibility tests...`);
    const axeBuilder = new AxePuppeteer(page);

    // Configure axe options
    if (config.axeOptions.rules && Object.keys(config.axeOptions.rules).length > 0) {
      axeBuilder.configure({ rules: config.axeOptions.rules });
    }

    if (config.axeOptions.tags && config.axeOptions.tags.length > 0) {
      axeBuilder.withTags(config.axeOptions.tags);
    }

    if (config.axeOptions.include && config.axeOptions.include.length > 0) {
      axeBuilder.include(config.axeOptions.include);
    }

    if (config.axeOptions.exclude && config.axeOptions.exclude.length > 0) {
      axeBuilder.exclude(config.axeOptions.exclude);
    }

    // Execute the accessibility scan
    const results = await axeBuilder.analyze();

    // Generate reports
    const reports = [];
    if (config.output.formats.includes('html')) {
      const htmlPath = generateHtmlReport(results, pageConfig.name, config.output.directory);
      reports.push({ type: 'html', path: htmlPath });
    }

    if (config.output.formats.includes('json')) {
      const jsonPath = generateJsonReport(results, pageConfig.name, config.output.directory);
      reports.push({ type: 'json', path: jsonPath });
    }

    // Log results summary
    const violations = results.violations || [];
    const passes = results.passes || [];
    const incomplete = results.incomplete || [];

    const violationsBySeverity = violations.reduce((acc, violation) => {
      acc[violation.impact] = (acc[violation.impact] || 0) + violation.nodes.length;
      return acc;
    }, { minor: 0, moderate: 0, serious: 0, critical: 0 });

    console.log(`📊 Results for ${pageConfig.name}:`);
    console.log(`   • Violations: ${violations.length} (Critical: ${violationsBySeverity.critical}, Serious: ${violationsBySeverity.serious}, Moderate: ${violationsBySeverity.moderate}, Minor: ${violationsBySeverity.minor})`);
    console.log(`   • Passes: ${passes.length}`);
    console.log(`   • Incomplete: ${incomplete.length}`);

    return {
      pageName: pageConfig.name,
      results,
      reports,
      screenshotPath,
      violationsBySeverity
    };

  } catch (error) {
    console.error(`❌ Error testing page ${pageConfig.name}:`, error.message);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Check if violations exceed thresholds
 */
function checkThresholds(allResults, config) {
  const totalViolationsBySeverity = { minor: 0, moderate: 0, serious: 0, critical: 0 };
  const totalIncomplete = allResults.reduce((total, result) => {
    // Count violations by severity
    Object.keys(result.violationsBySeverity).forEach(severity => {
      totalViolationsBySeverity[severity] += result.violationsBySeverity[severity];
    });

    return total + (result.results.incomplete?.length || 0);
  }, 0);

  const thresholds = config.thresholds;
  const failures = [];

  // Check violation thresholds
  Object.keys(totalViolationsBySeverity).forEach(severity => {
    const count = totalViolationsBySeverity[severity];
    const threshold = thresholds.violations[severity];

    if (count > threshold) {
      failures.push(`${severity} violations: ${count} (threshold: ${threshold})`);
    }
  });

  // Check incomplete threshold (simplified - just total count)
  if (totalIncomplete > Object.values(thresholds.incomplete).reduce((a, b) => a + b, 0)) {
    failures.push(`incomplete tests: ${totalIncomplete}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    totalViolationsBySeverity,
    totalIncomplete
  };
}

/**
 * Main function to run all accessibility tests
 */
async function runAccessibilityTests() {
  console.log('🚀 Starting accessibility tests...');
  console.log(`📋 Configuration: ${config.pages.length} pages to test`);

  // Ensure output directory exists
  ensureOutputDirectory(config.output.directory);

  // Wait for server to be ready (unless skipped)
  if (!args.includes('--skip-server-check')) {
    try {
      await waitForServer(config.baseUrl);
    } catch (error) {
      console.error('❌ Server check failed:', error.message);
      console.log('💡 Make sure your development server is running:');
      console.log('   npm start');
      console.log('   Or use --skip-server-check to bypass this check');
      process.exit(1);
    }
  } else {
    console.log('⚠️  Skipping server check as requested');
  }

  let browser;
  const allResults = [];

  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch(config.browserOptions);

    // Test each page
    for (const pageConfig of config.pages) {
      try {
        const result = await testPage(browser, pageConfig, config);
        allResults.push(result);
      } catch (error) {
        console.error(`❌ Failed to test page ${pageConfig.name}:`, error.message);
        // Continue with other pages
        allResults.push({
          pageName: pageConfig.name,
          results: { violations: [], passes: [], incomplete: [], inapplicable: [] },
          reports: [],
          screenshotPath: null,
          violationsBySeverity: { minor: 0, moderate: 0, serious: 0, critical: 0 },
          error: error.message
        });
      }
    }

    // Generate summary report
    console.log('📄 Generating summary report...');
    const summary = generateSummaryReport(allResults, config.output.directory);

    // Check thresholds
    const thresholdCheck = checkThresholds(allResults, config);

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 ACCESSIBILITY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Overall Status: ${thresholdCheck.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📄 Pages Tested: ${allResults.length}`);
    console.log(`🚨 Total Violations by Severity:`);
    console.log(`   • Critical: ${thresholdCheck.totalViolationsBySeverity.critical}`);
    console.log(`   • Serious: ${thresholdCheck.totalViolationsBySeverity.serious}`);
    console.log(`   • Moderate: ${thresholdCheck.totalViolationsBySeverity.moderate}`);
    console.log(`   • Minor: ${thresholdCheck.totalViolationsBySeverity.minor}`);
    console.log(`❓ Incomplete Tests: ${thresholdCheck.totalIncomplete}`);

    if (!thresholdCheck.passed) {
      console.log('\n❌ Threshold failures:');
      thresholdCheck.failures.forEach(failure => {
        console.log(`   • ${failure}`);
      });
    }

    console.log(`\n📁 Reports generated in: ${path.resolve(config.output.directory)}`);

    // List generated files
    console.log('\n📄 Generated files:');
    allResults.forEach(result => {
      if (result.reports && result.reports.length > 0) {
        result.reports.forEach(report => {
          console.log(`   • ${path.basename(report.path)} (${report.type})`);
        });
      }
      if (result.screenshotPath) {
        console.log(`   • ${path.basename(result.screenshotPath)} (screenshot)`);
      }
    });
    console.log(`   • accessibility-summary.json (summary)`);

    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(thresholdCheck.passed ? 0 : 1);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`\nUsage: node ${path.basename(__filename)} [options]\n\nOptions:\n  --help, -h              Show this help message\n  --version, -v           Show version information\n  --skip-server-check     Skip the server availability check\n\nConfiguration:\n  Edit axe.config.js to customize:\n  • Pages to test\n  • axe-core options and rules\n  • Output formats and directory\n  • Violation thresholds\n  • Browser settings\n\nExamples:\n  npm run test:accessibility\n  npm run test:accessibility -- --skip-server-check\n  node scripts/run-accessibility-tests.js\n  node scripts/run-accessibility-tests.js --skip-server-check\n`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const packageJson = require('../package.json');
  console.log(packageJson.version);
  process.exit(0);
}

// Run the tests
if (require.main === module) {
  runAccessibilityTests().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { runAccessibilityTests, testPage, checkThresholds };
