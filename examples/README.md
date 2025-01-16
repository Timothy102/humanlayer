<div align="center">
    <h2>HumanLayer Cookbooks and Examples</h2>
</div>

<h3>Email Classification with Async Human Review</h3>

<p>The <code>ts_email_classifier/03-human-review-async.ts</code> file demonstrates an advanced implementation of email classification with asynchronous human review capabilities. This example showcases the parallel processing of multiple emails and the integration of real-time human feedback.</p>

<h4>Key Features</h4>
<ul>
    <li><strong>Parallel Processing</strong>: Processes multiple emails simultaneously using <code>Promise.all</code>.</li>
    <li><strong>Database Integration</strong>: Tracks classification requests in a local SQLite database.</li>
    <li><strong>Webhook Support</strong>: Enables real-time updates via webhook notifications.</li>
</ul>

<h4>Prerequisites</h4>
<ol>
    <li><strong>Node.js</strong> and <strong>npm</strong> installed.</li>
    <li><strong>HumanLayer API key</strong> set in <code>.env</code>.</li>
    <li><strong>Webhook URL</strong> configured (e.g., using ngrok for local development).</li>
    <li><strong>Slack workspace</strong> configured (optional).</li>
</ol>

<h3>Setup and Running</h3>

<ol>
    <li><strong>Navigate to the project directory</strong>:
        <pre><code>cd ts_email_classifier</code></pre>
    </li>

    <li><strong>Install dependencies</strong>:
        <pre><code>npm install</code></pre>
    </li>

    <li><strong>Set up environment variables</strong>:
        <pre><code>cp .env.example .env</code></pre>
    </li>

    <li><strong>Run the human review script</strong>:
        <pre><code>npm run human-review-async</code></pre>
    </li>
</ol>

<h4>How It Works</h4>
<ol>
    <li>The script loads two sample emails from <code>common.ts</code>.</li>
    <li>Each email is classified by a language model (LLM).</li>
    <li>Classification requests are sent to human reviewers in parallel.</li>
    <li>Results are stored in a local database.</li>
    <li>Webhook notifications are sent when classifications are reviewed.</li>
</ol>

<h4>Monitoring</h4>
<ul>
    <li>Check the console output for classification progress.</li>
    <li>Monitor the database for request statuses.</li>
    <li>Watch the Slack channel for incoming review requests.</li>
    <li>Webhook endpoints receive real-time updates.</li>
</ul>
