export const Router = (() => {
  const routes = [];

  function add(path, handler) {
    routes.push({ path, handler });
  }

  function match(pathname) {
    for (const route of routes) {
      const paramNames = [];
      const regexPath = route.path.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      });

      const match = pathname.match(new RegExp("^" + regexPath + "$"));

      if (!match) continue;

      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return { handler: route.handler, params };
    }
  }

  function go(path) {
    document.body.classList.add("fade-out");

    setTimeout(() => {
      history.pushState({}, "", path);
      resolve();
    }, 300);
  }

  function resolve() {
    const result = match(location.pathname);
    if (result) {
      result.handler(result.params);
      void document.body.offsetWidth;
      document.body.classList.remove("fade-out");
    } else {
      console.warn("No route:", location.pathname);
    }
  }

  function start() {
    window.addEventListener("popstate", resolve);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-level]");
      if (!btn) return;

      const level = btn.dataset.level;
      Router.go(`/myquiz/${level}`);
    });

    resolve();
  }

  return { add, go, start };
})();
