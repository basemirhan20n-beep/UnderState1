export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Veri Kaydetme (Hasat yapıldığında buraya istek atılacak)
    if (request.method === "POST" && url.pathname === "/save") {
      const data = await request.json();
      await env.GAME_KV.put("gameState", JSON.stringify(data));
      return new Response("Kaydedildi", { status: 200 });
    }

    // Veri Çekme (Sayfa açıldığında veya yenilendiğinde)
    if (url.pathname === "/get") {
      const state = await env.GAME_KV.get("gameState");
      return new Response(state || "{}", {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Hiçbiri değilse hata döndür
    return new Response("Not Found", { status: 404 });
  }
};
