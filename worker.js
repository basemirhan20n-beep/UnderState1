export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Veri Çekme (Sayfa açıldığında veritabanından bilgileri getirir)
    if (url.pathname === "/api/get") {
      const state = await env.GAME_KV.get("gameState");
      return new Response(state || "{}", {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 2. Veri Kaydetme (Hasat yapıldığında veritabanına yazar)
    if (request.method === "POST" && url.pathname === "/api/save") {
      const data = await request.json();
      await env.GAME_KV.put("gameState", JSON.stringify(data));
      return new Response("Tamam", { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // 3. Hiçbiri değilse ana sayfayı (index.html) göster (Pages kullanıyorsan buna gerek kalmayabilir)
    return new Response("Worker Calisiyor", { status: 200 });
  }
};
