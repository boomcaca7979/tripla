/**
 * /auth/confirm — landing point for links Supabase mails out.
 *
 * Password recovery is the only flow that lands here: registration runs with
 * e-mail confirmation off (it returns a session directly), and there is no
 * OAuth or magic-link entry. A recovery link therefore arrives in one of two
 * shapes:
 *
 *  · `?code=…` — the PKCE authorization code. `resetPasswordForEmail` registers
 *    an S256 challenge, so a verified link comes back as a code rather than a
 *    URL fragment. Exchanged with `exchangeCodeForSession` (the verifier lives
 *    in the requesting browser's cookie).
 *  · `?token_hash=…&type=…` — the server-generated OTP link shape. Verified with
 *    `verifyOtp`.
 *
 * Both establish a cookie-backed session via the server client, then hand the
 * user to the new-password form (`/login?reset=1`) — a recovery session is only
 * useful once the password has actually been changed. An explicit same-site
 * `?next=` still wins, and failures fall back to /login rather than rendering an
 * error state here.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/** Where a successfully verified recovery link lands: the set-new-password form. */
const DEFAULT_DESTINATION = "/login?reset=1";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  // Only ever redirect to a same-site path — never an absolute URL from the query.
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : DEFAULT_DESTINATION;

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
