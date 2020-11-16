import qs from 'qs'
import { Dictionary } from '@billypon/ts-types'

export const isProd = process.env.NODE_ENV === 'production'

export function getQueryParams<T = qs.ParsedQs>(): T {
  return qs.parse(window.location.search.substr(1)) as unknown as T
}

export function buildUrl({ origin = '', path, query, hash = ''}: { origin?: string; path: string; query?: qs.ParsedQs | Dictionary; hash?: string }): string {
  return `${ origin }${ path }${ query ? `?${ qs.stringify(query) }` : '' }${ hash ? `#${ hash }` : '' }`
}

export function getPathAndQuery(): string {
  const { pathname, search } = window.location
  return pathname + search
}

export function getLoginUrl(currentUrl?: string): string {
  const redirectUrl = getPathAndQuery()
  return buildUrl({
    path: '/login',
    query: redirectUrl !== currentUrl ? { redirect: redirectUrl } : null,
  })
}

export function getLogoutUrl(currentUrl?: string): string {
  const redirectUrl = getPathAndQuery()
  return buildUrl({
    path: '/logout',
    query: redirectUrl !== currentUrl ? { redirect: redirectUrl } : null,
  })
}

export function getParentNode(triggerNode: HTMLElement): HTMLElement {
  return triggerNode.parentNode as HTMLElement
}
