/**
 * Client API — appels vers le backend FastAPI.
 * Injecte automatiquement le JWT Supabase dans chaque requête.
 */

import { supabase } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = await getToken();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Erreur API");
  }

  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────

export const auth = {
  signUp: (email, password) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signIn: (email, password) =>
    request("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ── Universes ─────────────────────────────────────────────────

export const universes = {
  list: () => request("/universes"),
  get: (id) => request(`/universes/${id}`),
  create: (data) =>
    request("/universes", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/universes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id) => request(`/universes/${id}`, { method: "DELETE" }),
};

// ── Characters ────────────────────────────────────────────────

export const characters = {
  list: (universeId) => request(`/universes/${universeId}/characters`),
  get: (universeId, id) =>
    request(`/universes/${universeId}/characters/${id}`),
  create: (universeId, data) =>
    request(`/universes/${universeId}/characters`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (universeId, id, data) =>
    request(`/universes/${universeId}/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (universeId, id) =>
    request(`/universes/${universeId}/characters/${id}`, { method: "DELETE" }),
  // Relations
  getRelations: (universeId, id) =>
    request(`/universes/${universeId}/characters/${id}/relations`),
  addRelation: (universeId, id, data) =>
    request(`/universes/${universeId}/characters/${id}/relations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Maps ──────────────────────────────────────────────────────

export const maps = {
  list: (universeId) => request(`/universes/${universeId}/maps`),
  get: (universeId, id) => request(`/universes/${universeId}/maps/${id}`),
  create: (universeId, data) =>
    request(`/universes/${universeId}/maps`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMarkers: (universeId, mapId) =>
    request(`/universes/${universeId}/maps/${mapId}/markers`),
  addMarker: (universeId, mapId, data) =>
    request(`/universes/${universeId}/maps/${mapId}/markers`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── LoreChat ──────────────────────────────────────────────────

export const chat = {
  history: (universeId, limit = 50) =>
    request(`/universes/${universeId}/chat/history?limit=${limit}`),

  /** Envoie une question et retourne un EventSource (SSE). */
  ask: async (universeId, question) => {
    const token = await getToken();
    return fetch(`${BASE_URL}/universes/${universeId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question }),
    });
  },
};
