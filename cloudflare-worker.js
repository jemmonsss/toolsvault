addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})

// Subdomain -> site path mounts. Anything not listed is treated as a tool (/tools/<sub>/).
const SECTIONS = {
  blog:  '/blog',
  about: '/about',
  games: '/games',
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const host = url.hostname
  const ORIGIN_HOST = 'www.toolsvault.org'
  const RESOLVE     = 'jemmonsss.github.io'
  const SUFFIX = '.toolsvault.org'

  let targetPath = url.pathname

  if (host.endsWith(SUFFIX) && host !== 'www' + SUFFIX && host !== 'toolsvault.org') {
    const sub = host.slice(0, -SUFFIX.length)
    const rootPrefixes = ['/assets/', '/favicon.svg', '/robots.txt',
                          '/sitemap.xml', '/tools/', '/about/', '/blog/', '/games/', '/404.html']

    if (sub === 'tools') {
      const isRoot = rootPrefixes.some(p => url.pathname === p || url.pathname.startsWith(p))
      targetPath = isRoot ? url.pathname : '/tools' + (url.pathname === '/' ? '/' : url.pathname)
    } else if (SECTIONS[sub]) {
      targetPath = (url.pathname === '/') ? SECTIONS[sub] + '/' : url.pathname
    } else {
      const isRoot = rootPrefixes.some(p => url.pathname === p || url.pathname.startsWith(p))
      targetPath = (url.pathname === '/' || !isRoot)
        ? '/tools/' + sub + (url.pathname === '/' ? '/' : url.pathname)
        : url.pathname
    }
  }

  const target = 'https://' + ORIGIN_HOST + targetPath + url.search
  const response = await fetch(target, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow',
    cf: { resolveOverride: RESOLVE }
  })

  const cacheable = url.pathname.match(/\.(css|woff2|js|png|jpg|jpeg|gif|svg|ico|webp|avif)$/i)
  const cacheControl = cacheable
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=3600, must-revalidate'

  const headers = new Headers(response.headers)
  headers.set('Cache-Control', cacheControl)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
