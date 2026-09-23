/**
 * /auth/confirm — landing point for links Supabase mails out.
 *
 * Registration does NOT use this route: the project runs with e-mail
 * confirmation off, so signup returns a session directly. What still lands here
 * is password recovery (and any future mailed flow), which can arrive in two
 * shapes:
 *
 *  · `?token_hash=…&type=recovery|email|signup` — the server-generated OTP link.
 *    Verified with `verifyOtp`.
 *  · `?code=…` — the PKCE authorization code returned when a flow was started
 *    with a `redirectTo` (our password-reset call uses this). Exchanged with
 *    `exchangeCodeForSession`.
 *
 * Both establish cookie-backed sessions via the server client, so a user who
 * clicks the e-mail link ends up signed in exactly like one who typed the
 * mailed code — there is still only ONE real auth system.
 *
 * Nothing is trusted from the URL beyond these parameters; failures fall back
 * to /login rather than rendering an error state here.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_NEXT = "/trips";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  // Only ever redirect to a same-site path — never an absolute URL from the query.
  const rawNext = searchParams.get("next") ?? DEFAULT_NEXT;
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : DEFAULT_NEXT;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL("/login?verification=failed", origin));
}
