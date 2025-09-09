const fs = require('fs');
const path = require('path');

/**
 * Generate HTML report from axe results
 */
function generateHtmlReport(results, pageName, outputDir) {
  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];
  const inapplicable = results.inapplicable || [];
  
  const timestamp = new Date().toISOString();
  const violationCount = violations.length;
  const passCount = passes.length;
  const incompleteCount = incomplete.length;
  
  // Calculate total issues by severity
  const severityCounts = violations.reduce((acc, violation) => {
    acc[violation.impact] = (acc[violation.impact] || 0) + violation.nodes.length;
    return acc;
  }, { minor: 0, moderate: 0, serious: 0, critical: 0 });
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Report - ${pageName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .header h1 {
            color: #2563eb;
            margin-bottom: 1rem;
        }
        
        .meta-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .meta-item {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 4px;
        }
        
        .meta-label {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.25rem;
        }
        
        .meta-value {
            font-weight: 600;
            font-size: 1.125rem;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .summary-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .summary-card.critical { border-left: 4px solid #ef4444; }
        .summary-card.serious { border-left: 4px solid #f97316; }
        .summary-card.moderate { border-left: 4px solid #eab308; }
        .summary-card.minor { border-left: 4px solid #3b82f6; }
        .summary-card.passes { border-left: 4px solid #22c55e; }
        .summary-card.incomplete { border-left: 4px solid #8b5cf6; }
        
        .summary-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .summary-label {
            font-size: 0.875rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .section {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            overflow: hidden;
        }
        
        .section-header {
            background: #f3f4f6;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
        }
        
        .violation-item {
            border-bottom: 1px solid #e5e7eb;
            padding: 1.5rem;
        }
        
        .violation-item:last-child {
            border-bottom: none;
        }
        
        .violation-header {
            display: flex;
            align-items: start;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .impact-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .impact-critical { background: #fef2f2; color: #dc2626; }
        .impact-serious { background: #fff7ed; color: #ea580c; }
        .impact-moderate { background: #fefce8; color: #ca8a04; }
        .impact-minor { background: #eff6ff; color: #2563eb; }
        
        .violation-title {
            font-weight: 600;
            color: #111827;
            flex: 1;
        }
        
        .violation-description {
            color: #6b7280;
            margin-bottom: 1rem;
        }
        
        .violation-help {
            background: #f9fafb;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
        }
        
        .violation-help a {
            color: #2563eb;
            text-decoration: none;
        }
        
        .violation-help a:hover {
            text-decoration: underline;
        }
        
        .nodes-list {
            margin-top: 1rem;
        }
        
        .node-item {
            background: #fafafa;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.875rem;
        }
        
        .node-target {
            color: #7c2d12;
            margin-bottom: 0.5rem;
        }
        
        .node-html {
            color: #1f2937;
            white-space: pre-wrap;
            word-break: break-all;
        }
        
        .collapse-toggle {
            background: none;
            border: none;
            color: #2563eb;
            cursor: pointer;
            font-size: 0.875rem;
            padding: 0.25rem 0;
            margin-top: 0.5rem;
        }
        
        .collapse-toggle:hover {
            text-decoration: underline;
        }
        
        .collapsible-content {
            display: none;
            margin-top: 0.5rem;
        }
        
        .collapsible-content.show {
            display: block;
        }
        
        .footer {
            text-align: center;
            padding: 2rem;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Accessibility Test Report</h1>
            <div class="meta-info">
                <div class="meta-item">
                    <div class="meta-label">Page</div>
                    <div class="meta-value">${pageName}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">URL</div>
                    <div class="meta-value">${results.url || 'N/A'}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Generated</div>
                    <div class="meta-value">${new Date(timestamp).toLocaleString()}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">axe-core Version</div>
                    <div class="meta-value">${results.testEngine?.version || 'Unknown'}</div>
                </div>
            </div>
        </header>
        
        <div class="summary">
            <div class="summary-card critical">
                <div class="summary-number">${severityCounts.critical}</div>
                <div class="summary-label">Critical</div>
            </div>
            <div class="summary-card serious">
                <div class="summary-number">${severityCounts.serious}</div>
                <div class="summary-label">Serious</div>
            </div>
            <div class="summary-card moderate">
                <div class="summary-number">${severityCounts.moderate}</div>
                <div class="summary-label">Moderate</div>
            </div>
            <div class="summary-card minor">
                <div class="summary-number">${severityCounts.minor}</div>
                <div class="summary-label">Minor</div>
            </div>
            <div class="summary-card passes">
                <div class="summary-number">${passCount}</div>
                <div class="summary-label">Passes</div>
            </div>
            <div class="summary-card incomplete">
                <div class="summary-number">${incompleteCount}</div>
                <div class="summary-label">Incomplete</div>
            </div>
        </div>
        
        ${violations.length > 0 ? `
        <section class="section">
            <div class="section-header">
                <h2 class="section-title">Violations (${violations.length})</h2>
            </div>
            ${violations.map((violation, index) => `
                <div class="violation-item">
                    <div class="violation-header">
                        <span class="impact-badge impact-${violation.impact}">${violation.impact}</span>
                        <h3 class="violation-title">${violation.id}: ${violation.help}</h3>
                    </div>
                    
                    <div class="violation-description">
                        ${violation.description}
                    </div>
                    
                    <div class="violation-help">
                        <strong>How to fix:</strong> ${violation.helpUrl ? `<a href="${violation.helpUrl}" target="_blank">Learn more</a>` : 'See axe-core documentation'}
                    </div>
                    
                    <div class="nodes-list">
                        <strong>Affected elements (${violation.nodes.length}):</strong>
                        ${violation.nodes.map((node, nodeIndex) => `
                            <div class="node-item">
                                <div class="node-target">Target: ${node.target.join(', ')}</div>
                                <button class="collapse-toggle" onclick="toggleCollapse('violation-${index}-node-${nodeIndex}')">
                                    Show HTML
                                </button>
                                <div id="violation-${index}-node-${nodeIndex}" class="collapsible-content">
                                    <div class="node-html">${node.html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </section>
        ` : ''}
        
        ${incomplete.length > 0 ? `
        <section class="section">
            <div class="section-header">
                <h2 class="section-title">Incomplete Tests (${incomplete.length})</h2>
            </div>
            ${incomplete.map((item, index) => `
                <div class="violation-item">
                    <div class="violation-header">
                        <span class="impact-badge impact-minor">Review</span>
                        <h3 class="violation-title">${item.id}: ${item.help}</h3>
                    </div>
                    
                    <div class="violation-description">
                        ${item.description}
                    </div>
                    
                    <div class="violation-help">
                        <strong>Manual review required:</strong> ${item.helpUrl ? `<a href="${item.helpUrl}" target="_blank">Learn more</a>` : 'See axe-core documentation'}
                    </div>
                </div>
            `).join('')}
        </section>
        ` : ''}
        
        <footer class="footer">
            <p>Generated by axe-core accessibility testing suite</p>
        </footer>
    </div>
    
    <script>
        function toggleCollapse(id) {
            const element = document.getElementById(id);
            const button = element.previousElementSibling;
            
            if (element.classList.contains('show')) {
                element.classList.remove('show');
                button.textContent = 'Show HTML';
            } else {
                element.classList.add('show');
                button.textContent = 'Hide HTML';
            }
        }
    </script>
</body>
</html>
  `.trim();
  
  const filename = `axe-${pageName}.html`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`✅ HTML report generated: ${filepath}`);
  
  return filepath;
}

/**
 * Generate JSON report from axe results
 */
function generateJsonReport(results, pageName, outputDir) {
  const report = {
    page: pageName,
    url: results.url,
    timestamp: new Date().toISOString(),
    testEngine: results.testEngine,
    testRunner: results.testRunner,
    testEnvironment: results.testEnvironment,
    summary: {
      violations: results.violations?.length || 0,
      passes: results.passes?.length || 0,
      incomplete: results.incomplete?.length || 0,
      inapplicable: results.inapplicable?.length || 0
    },
    violationsBySeverity: results.violations?.reduce((acc, violation) => {
      acc[violation.impact] = (acc[violation.impact] || 0) + violation.nodes.length;
      return acc;
    }, { minor: 0, moderate: 0, serious: 0, critical: 0 }) || {},
    results: {
      violations: results.violations || [],
      passes: results.passes || [],
      incomplete: results.incomplete || [],
      inapplicable: results.inapplicable || []
    }
  };
  
  const filename = `axe-${pageName}.json`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`✅ JSON report generated: ${filepath}`);
  
  return filepath;
}

/**
 * Generate summary report from multiple test results
 */
function generateSummaryReport(allResults, outputDir) {
  const summary = {
    timestamp: new Date().toISOString(),
    totalPages: allResults.length,
    overallStatus: 'PASS',
    summary: {
      totalViolations: 0,
      totalPasses: 0,
      totalIncomplete: 0,
      totalInapplicable: 0
    },
    violationsBySeverity: { minor: 0, moderate: 0, serious: 0, critical: 0 },
    pageResults: []
  };
  
  allResults.forEach(({ pageName, results }) => {
    const violations = results.violations || [];
    const passes = results.passes || [];
    const incomplete = results.incomplete || [];
    const inapplicable = results.inapplicable || [];
    
    const pageViolationsBySeverity = violations.reduce((acc, violation) => {
      acc[violation.impact] = (acc[violation.impact] || 0) + violation.nodes.length;
      return acc;
    }, { minor: 0, moderate: 0, serious: 0, critical: 0 });
    
    const pageStatus = violations.length === 0 ? 'PASS' : 'FAIL';
    if (pageStatus === 'FAIL') {
      summary.overallStatus = 'FAIL';
    }
    
    // Update totals
    summary.summary.totalViolations += violations.length;
    summary.summary.totalPasses += passes.length;
    summary.summary.totalIncomplete += incomplete.length;
    summary.summary.totalInapplicable += inapplicable.length;
    
    // Update severity counts
    Object.keys(pageViolationsBySeverity).forEach(severity => {
      summary.violationsBySeverity[severity] += pageViolationsBySeverity[severity];
    });
    
    summary.pageResults.push({
      page: pageName,
      url: results.url,
      status: pageStatus,
      violations: violations.length,
      violationsBySeverity: pageViolationsBySeverity,
      passes: passes.length,
      incomplete: incomplete.length,
      inapplicable: inapplicable.length
    });
  });
  
  const filepath = path.join(outputDir, 'accessibility-summary.json');
  fs.writeFileSync(filepath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`✅ Summary report generated: ${filepath}`);
  
  return summary;
}

/**
 * Take screenshot of the page
 */
async function takeScreenshot(page, pageName, outputDir) {
  try {
    const filename = `screenshot-${pageName}.png`;
    const filepath = path.join(outputDir, filename);
    
    await page.screenshot({
      path: filepath,
      fullPage: true
    });
    
    console.log(`📸 Screenshot saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.warn(`⚠️  Failed to take screenshot for ${pageName}:`, error.message);
    return null;
  }
}

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }
}

module.exports = {
  generateHtmlReport,
  generateJsonReport,
  generateSummaryReport,
  takeScreenshot,
  ensureOutputDirectory
};
