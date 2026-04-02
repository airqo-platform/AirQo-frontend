export const prerender = false;

export default async function handler() {
  return new Response(JSON.stringify({ ok: true, source: "data-loader" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
