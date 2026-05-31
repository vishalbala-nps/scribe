// @ts-nocheck — Deno globals (Deno.serve, Deno.env) aren't known to VS Code's TS server
import { createClient } from "@supabase/supabase-js"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS })
  }

  // Verify the calling user via their JWT
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS })
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )

  // Delete all the user's notes first
  const { error: notesError } = await adminClient.from("Notes").delete().eq("user_id", user.id)
  if (notesError) {
    return Response.json({ error: "Failed to delete notes" }, { status: 500, headers: CORS_HEADERS })
  }

  // Delete the user account
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500, headers: CORS_HEADERS })
  }

  return Response.json({ success: true }, { headers: CORS_HEADERS })
})
