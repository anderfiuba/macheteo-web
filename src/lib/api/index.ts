"use client";
import { API_MODE, isSupabaseConfigured } from "@/lib/config";
import { mockApi } from "./mock";
import { supabaseApi } from "./supabase";
import type { MacheteoApi } from "./types";

export const api: MacheteoApi = API_MODE === "supabase" && isSupabaseConfigured ? supabaseApi : mockApi;
export * from "./types";
