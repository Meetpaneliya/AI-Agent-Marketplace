import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fileName, fileContent } = await req.json();

    // Check for obvious malicious patterns
    const content = typeof fileContent === "string" ? fileContent : JSON.stringify(fileContent || "");
    const issues: string[] = [];

    if (/process\.env|eval\(|child_process/i.test(content)) {
      issues.push("Potentially dangerous environment or execution call detected.");
    }

    const passed = issues.length === 0;

    return NextResponse.json({
      success: true,
      data: {
        scan: {
          passed,
          fileName: fileName || "workflow.json",
          securityScore: passed ? 98 : 45,
          timestamp: new Date().toISOString(),
          issues,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Scan failed" } },
      { status: 500 }
    );
  }
}
