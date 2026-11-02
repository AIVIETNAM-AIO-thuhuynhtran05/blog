// Đường dẫn con của blog, rỗng khi blog nằm ở gốc domain
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// Đường dẫn của trang, đã bỏ đường dẫn con, để so với các link như /about
export function pagePath(url: URL) {
  return url.pathname.slice(base.length).replace(/\/$/, '');
}
