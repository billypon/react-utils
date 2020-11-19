import Axios from 'axios-observable'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { StringDictionary } from '@billypon/ts-types'

export type AxiosLoggerFn = (object: unknown, message: string) => void

export interface AxiosLogger {
  debug: AxiosLoggerFn
  info: AxiosLoggerFn
  error: AxiosLoggerFn
}

export function getLogMsg({ method, url, baseURL }: AxiosRequestConfig): string {
  return `${ method.toUpperCase() } ${ (baseURL && url.substr(0, baseURL.length) !== baseURL ? baseURL : '') + url }`
}

export function getFullUrl({ url, baseURL }: AxiosRequestConfig): string {
  return (baseURL && url.substr(0, baseURL.length) !== baseURL ? baseURL : '') + url
}

export function getConfigMsg({ baseURL, url, method, params, data, headers }: AxiosRequestConfig) {
  const methods = [ 'common', 'head', 'get', 'post', 'put', 'patch', 'delete' ]
  const dict: StringDictionary = { }
  if (headers.common) {
    Object.entries(headers.common).forEach(([ key, value ]) => {
      dict[key] = value as string
    })
    Object.entries(headers[method]).forEach(([ key, value ]) => {
      dict[key] = value as string
    })
    Object.entries(headers).forEach(([ key, value ]) => {
      if (!methods.includes(key)) {
        dict[key] = value as string
      }
    })
  }
  return { baseURL, url, method, params, data, headers: headers.common ? dict : headers }
}

export function getResponseMsg(response: AxiosResponse) {
  if (!response) {
    return null
  }
  const { data, status, statusText, headers } = response
  return { data, status, statusText, headers }
}

function useInterceptors(axios: Axios, logger: AxiosLogger): void {
  logger = logger || {
    debug: console.debug,
    info: console.info,
    error: console.error,
  }
  axios.interceptors.request.use(config => {
    logger.debug(getConfigMsg(config), getLogMsg(config))
    return config
  }, ({ config }) => {
    logger.error(getConfigMsg(config), getLogMsg(config))
    return Promise.reject(null)
  })

  axios.interceptors.response.use(response => {
    const { config } = response
    logger.info({ response: getResponseMsg(response), config: getConfigMsg(config) }, getLogMsg(config))
    return response
  }, ({ config, response }) => {
    logger.error({ response: getResponseMsg(response), config: getConfigMsg(config) }, getLogMsg(config))
    return Promise.reject(response && response.data)
  })
}

export { useInterceptors }
