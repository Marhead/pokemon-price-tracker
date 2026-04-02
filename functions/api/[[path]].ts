interface Env {
  BACKEND_URL: string
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const backendUrl = `${context.env.BACKEND_URL}${url.pathname}${url.search}`

  return fetch(backendUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: ['GET', 'HEAD'].includes(context.request.method)
      ? undefined
      : context.request.body,
  })
}
