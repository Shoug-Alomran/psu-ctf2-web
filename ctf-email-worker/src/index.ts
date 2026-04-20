interface Env {
  RESEND_API_KEY: string;
}

const RECIPIENT_EMAIL = "cybertech@psu.edu.sa";
const SENDER_EMAIL = "shoug.alomran@shoug-tech.com";

const ALLOWED_ORIGINS = new Set([
  "https://psu-ctf.shoug-tech.com",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = buildCorsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method === "GET") {
      return new Response("CTF email worker is running", {
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return json({ success: false, error: "Method not allowed" }, 405, corsHeaders);
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return json({ success: false, error: "Origin not allowed" }, 403, corsHeaders);
    }

    try {
      const formData = await request.formData();

      const studentEmail = String(formData.get("studentEmail") || "").trim();
      const topic = String(formData.get("topic") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const solution = String(formData.get("solution") || "").trim();
      const files = formData.getAll("attachments");

      if (!studentEmail || !topic || !subject || !solution) {
        return json({ success: false, error: "Missing required fields" }, 400, corsHeaders);
      }

      const attachments: Array<{ filename: string; content: string }> = [];

      for (const item of files) {
        if (!(item instanceof File)) continue;

        const buffer = await item.arrayBuffer();
        attachments.push({
          filename: item.name,
          content: arrayBufferToBase64(buffer),
        });
      }

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `CTF Bot <${SENDER_EMAIL}>`,
          to: [RECIPIENT_EMAIL],
          reply_to: [studentEmail],
          subject,
          text: [
            `Student Email: ${studentEmail}`,
            `Topic: ${topic}`,
            "",
            "Solution:",
            solution,
          ].join("\n"),
          attachments,
        }),
      });

      const result = await resendResponse.json<any>();

      if (!resendResponse.ok) {
        return json(
          {
            success: false,
            error: result?.message || "Email failed",
            resend: result,
          },
          resendResponse.status,
          corsHeaders
        );
      }

      return json(
        {
          success: true,
          message: "Email sent successfully",
          resend: result,
        },
        200,
        corsHeaders
      );
    } catch (error: any) {
      return json(
        {
          success: false,
          error: error?.message || "Internal error",
        },
        500,
        corsHeaders
      );
    }
  },
};

function buildCorsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };

  if (ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}