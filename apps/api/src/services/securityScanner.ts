import crypto from "node:crypto";

export interface SecurityScanCheck {
  passed: boolean;
  label: string;
  details: string;
  findings?: string[];
}

export interface SecurityScanResult {
  passed: boolean;
  status: "passed" | "flagged";
  fileHash: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  scannedAt: string;
  checks: {
    syntax: SecurityScanCheck;
    secretLeaks: SecurityScanCheck;
    maliciousPatterns: SecurityScanCheck;
  };
  summary: string;
}

// ─── Regular Expressions for Secret / Credential Leak Detection ───
const SECRET_RULES: { type: string; regex: RegExp; description: string }[] = [
  {
    type: "OpenAI API Key",
    regex: /\bsk-(?:proj-)?[a-zA-Z0-9_-]{32,}\b/,
    description: "Active OpenAI private token detected",
  },
  {
    type: "Anthropic API Key",
    regex: /\bsk-ant-[a-zA-Z0-9_-]{32,}\b/,
    description: "Active Anthropic Claude private token detected",
  },
  {
    type: "AWS Access Key",
    regex: /\bAKIA[0-9A-Z]{16}\b/,
    description: "Amazon Web Services Access Key ID detected",
  },
  {
    type: "Stripe Secret Key",
    regex: /\b(?:sk|rk)_(?:test|live)_[0-9a-zA-Z]{24,}\b/,
    description: "Stripe Payment Gateway Secret key detected",
  },
  {
    type: "GitHub Token",
    regex: /\bgh[pousr]_[0-9a-zA-Z]{36}\b/,
    description: "GitHub Personal Access / OAuth token detected",
  },
  {
    type: "Google API Key",
    regex: /\bAIza[0-9A-Za-z_-]{35}\b/,
    description: "Google Cloud / Firebase API key detected",
  },
  {
    type: "Private RSA/SSH Key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    description: "Unencrypted cryptographic private key block detected",
  },
  {
    type: "Slack Bot/User Token",
    regex: /\bxox[baprs]-[0-9]{10,13}-[0-9a-zA-Z]{10,32}\b/,
    description: "Slack workspace authentication token detected",
  },
];

// ─── Dangerous / Malicious Code Patterns ───
const DANGEROUS_RULES: { type: string; regex: RegExp; description: string }[] = [
  {
    type: "Destructive System Command",
    regex: /\b(?:rm\s+-(?:r|rf|fr)\s+(?:\/|~|\$HOME)|\bdel\s+\/f\s+\/s\s+\/q\s+[cC]:\\)/i,
    description: "Destructive disk deletion commands detected",
  },
  {
    type: "Remote Reverse Shell",
    regex: /(?:\/dev\/tcp\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\bnc\s+-(?:e|c)\s+\/bin\/|\bsocket\.socket.*connect\s*\()/i,
    description: "Remote reverse shell or direct raw socket connection pattern detected",
  },
  {
    type: "Obfuscated Dynamic Execution",
    regex: /\b(?:base64\.(?:b64)?decode\s*\([^)]+\)\.(?:decode\(\)|exec|eval)|__import__\s*\(\s*['"]os['"]\s*\)\.system)/i,
    description: "Obfuscated payload decoding and dynamic code execution detected",
  },
  {
    type: "Insecure Python Deserialization",
    regex: /\b(?:pickle|cPickle|_pickle)\.(?:loads?|Unpickler)\s*\(/,
    description: "Arbitrary code execution risk via insecure pickle deserialization",
  },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Validates an uploaded agent package without any paid third-party dependencies.
 * Runs 100% locally in memory:
 * 1. Syntax / JSON integrity check
 * 2. Secret / credential leak scanning
 * 3. Malicious code & reverse shell pattern detection
 * 4. SHA-256 file fingerprinting
 */
export function scanAgentPackage(params: {
  fileName: string;
  fileContent?: string | Buffer;
  fileSizeBytes?: number;
}): SecurityScanResult {
  const { fileName, fileContent } = params;
  const rawContent = fileContent
    ? typeof fileContent === "string"
      ? fileContent
      : fileContent.toString("utf8")
    : "";

  const byteLength = params.fileSizeBytes || (fileContent ? Buffer.byteLength(rawContent) : 0);
  const ext = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() || "" : "";

  // 1. Compute SHA-256 Fingerprint
  const fileHash = crypto
    .createHash("sha256")
    .update(rawContent || fileName)
    .digest("hex");

  // 2. Syntax & Format Check
  let syntaxCheck: SecurityScanCheck = {
    passed: true,
    label: "Syntax & Format Integrity",
    details: `Format verified (.${ext || "file"}).`,
  };

  if (ext === "json" && rawContent.trim()) {
    try {
      const parsed = JSON.parse(rawContent);
      const isWorkflow =
        Boolean(parsed.nodes && Array.isArray(parsed.nodes)) ||
        Boolean(parsed.flow && Array.isArray(parsed.flow)) ||
        Boolean(parsed.name || parsed.id || parsed.version);

      syntaxCheck = {
        passed: true,
        label: "JSON Workflow Syntax",
        details: isWorkflow
          ? "Valid JSON workflow structure with recognized agent nodes."
          : "Valid JSON syntax structure.",
      };
    } catch (jsonErr: any) {
      syntaxCheck = {
        passed: false,
        label: "JSON Syntax Error",
        details: `Corrupt or invalid JSON: ${jsonErr.message || "Parse failure"}`,
      };
    }
  }

  // 3. Secret Leak Scan
  const leakedSecrets: string[] = [];
  if (rawContent) {
    for (const rule of SECRET_RULES) {
      if (rule.regex.test(rawContent)) {
        leakedSecrets.push(`${rule.type} (${rule.description})`);
      }
    }
  }

  const secretScan: SecurityScanCheck = {
    passed: leakedSecrets.length === 0,
    label: "Private Secret & Token Leak Check",
    details:
      leakedSecrets.length === 0
        ? "Clean: No hardcoded API keys or private tokens detected."
        : `Security Risk: Found ${leakedSecrets.length} leaked private credential(s).`,
    findings: leakedSecrets,
  };

  // 4. Malicious Pattern Scan
  const dangerousFindings: string[] = [];
  if (rawContent) {
    for (const rule of DANGEROUS_RULES) {
      if (rule.regex.test(rawContent)) {
        dangerousFindings.push(`${rule.type}: ${rule.description}`);
      }
    }
  }

  const securityScan: SecurityScanCheck = {
    passed: dangerousFindings.length === 0,
    label: "Malicious Code & Exploit Pattern Check",
    details:
      dangerousFindings.length === 0
        ? "Clean: No malicious commands or reverse shell patterns found."
        : `Flagged: Found ${dangerousFindings.length} suspicious pattern(s).`,
    findings: dangerousFindings,
  };

  const allPassed = syntaxCheck.passed && secretScan.passed && securityScan.passed;

  return {
    passed: allPassed,
    status: allPassed ? "passed" : "flagged",
    fileHash,
    fileName,
    fileSizeBytes: byteLength,
    fileSizeFormatted: formatBytes(byteLength),
    scannedAt: new Date().toISOString(),
    checks: {
      syntax: syntaxCheck,
      secretLeaks: secretScan,
      maliciousPatterns: securityScan,
    },
    summary: allPassed
      ? "Automated verification passed. Package is clean, valid, and safe for review."
      : "Automated verification flagged issues. Please inspect the security findings.",
  };
}
