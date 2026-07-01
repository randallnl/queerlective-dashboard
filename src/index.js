const apiRoutes = {
  "/api/health": () =>
    Response.json({
      ok: true,
      service: "queerlective-dashboard",
      timestamp: new Date().toISOString(),
    }),
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = apiRoutes[url.pathname];

    if (route) {
      return route(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
