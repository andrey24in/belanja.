// Cloudflare Pages Function — proxy ke Apps Script.
// HP memanggil  belanja-a9e.pages.dev/api?...  (domain sendiri, tanpa CORS).
// Cloudflare yang meneruskan ke Apps Script, lalu mengembalikan hasilnya.

const APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbzAJdgmCINn3aYKYY31yeToSmKnaqH-q4XQf9xe8kZc5g3lF7iwc9ZUmmIDdTi-WpyIeA/exec";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  // salin semua parameter (action, id, payload, dst) ke Apps Script
  const target = APPS_SCRIPT + url.search;

  try {
    const resp = await fetch(target, { method: "GET", redirect: "follow" });
    const text = await resp.text();
    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, pesan: "Proxy gagal: " + err }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" }
    });
  }
}
