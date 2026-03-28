import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

type SyncResult = {
  covers: number;
  checkAvg: number;
  totalRevenue: number;
  itemSales: Array<{ product_number: string; quantity: number }>;
  posSystem: "toast" | "square";
  status: "success" | "error" | "partial";
  errorMsg?: string;
};

async function syncToast(): Promise<SyncResult> {
  const liveSyncEnabled = Deno.env.get("POS_SYNC_LIVE_ENABLED") === "true";
  const apiKey = Deno.env.get("TOAST_API_KEY");
  const restaurantGuid = Deno.env.get("TOAST_RESTAURANT_GUID");
  if (!liveSyncEnabled) {
    return {
      covers: 0,
      checkAvg: 0,
      totalRevenue: 0,
      itemSales: [],
      posSystem: "toast",
      status: "error",
      errorMsg: "Toast sync is disabled. Set POS_SYNC_LIVE_ENABLED=true after implementing live API calls.",
    };
  }

  if (!apiKey || !restaurantGuid) {
    return {
      covers: 0,
      checkAvg: 0,
      totalRevenue: 0,
      itemSales: [],
      posSystem: "toast",
      status: "error",
      errorMsg: "Toast sync is enabled but required credentials are missing.",
    };
  }

  return {
    covers: 0,
    checkAvg: 0,
    totalRevenue: 0,
    itemSales: [],
    posSystem: "toast",
    status: "error",
    errorMsg: "Toast live sync is not implemented yet.",
  };
}

async function syncSquare(): Promise<SyncResult> {
  const liveSyncEnabled = Deno.env.get("POS_SYNC_LIVE_ENABLED") === "true";
  const token = Deno.env.get("SQUARE_ACCESS_TOKEN");
  const locationId = Deno.env.get("SQUARE_LOCATION_ID");
  if (!liveSyncEnabled) {
    return {
      covers: 0,
      checkAvg: 0,
      totalRevenue: 0,
      itemSales: [],
      posSystem: "square",
      status: "error",
      errorMsg: "Square sync is disabled. Set POS_SYNC_LIVE_ENABLED=true after implementing live API calls.",
    };
  }

  if (!token || !locationId) {
    return {
      covers: 0,
      checkAvg: 0,
      totalRevenue: 0,
      itemSales: [],
      posSystem: "square",
      status: "error",
      errorMsg: "Square sync is enabled but required credentials are missing.",
    };
  }

  return {
    covers: 0,
    checkAvg: 0,
    totalRevenue: 0,
    itemSales: [],
    posSystem: "square",
    status: "error",
    errorMsg: "Square live sync is not implemented yet.",
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const posSystem = (Deno.env.get("POS_SYSTEM") ?? "toast") as "toast" | "square";
    const locationId = Deno.env.get("LOCATION_ID");

    if (!supabaseUrl || !serviceRole || !locationId) {
      return Response.json(
        { error: "Missing Supabase service credentials or LOCATION_ID for POS sync." },
        { status: 500, headers: corsHeaders },
      );
    }

    const admin = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const result = posSystem === "square" ? await syncSquare() : await syncToast();

    await admin.from("pos_sync_log").insert({
      pos_system: result.posSystem,
      covers: result.covers,
      check_avg: result.checkAvg,
      status: result.status,
      error_msg: result.errorMsg ?? null,
      location_id: locationId,
    });

    await admin.from("daily_metrics").upsert(
      {
        date: new Date().toISOString().slice(0, 10),
        location_id: locationId,
        covers: result.covers,
        check_avg: result.checkAvg,
        total_revenue: result.totalRevenue,
        source: "pos",
      },
      { onConflict: "date,location_id" },
    );

    const velocityMap = new Map(result.itemSales.map((sale) => [sale.product_number, sale.quantity]));
    const { data: items } = await admin.from("inventory_items").select("item_id, product_number, expected_quantity");

    if (items?.length) {
      const updates = items
        .filter((item) => item.product_number && velocityMap.has(item.product_number))
        .map((item) => ({
          item_id: item.item_id,
          expected_quantity: Math.max(Number(item.expected_quantity ?? 0), Number(velocityMap.get(item.product_number!) ?? 0)),
        }));

      for (const item of updates) {
        await admin.from("inventory_items").update({ expected_quantity: item.expected_quantity }).eq("item_id", item.item_id);
      }
    }

    return Response.json(
      {
        ok: true,
        status: result.status,
        posSystem: result.posSystem,
        covers: result.covers,
        checkAvg: result.checkAvg,
        totalRevenue: result.totalRevenue,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown POS sync error." },
      { status: 500, headers: corsHeaders },
    );
  }
});
