export function createPageUrl(page) {
  if (!page) return "/";
  return page === "Home" ? "/" : `/${page.toLowerCase()}`;
}