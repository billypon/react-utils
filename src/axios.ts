import Axios from 'axios-observable'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

export type AxiosLoggerFn = (object: unknown, message: string) => void

export interface AxiosLogger {
  debug: AxiosLoggerFn
  info: AxiosLoggerFn
  error: AxiosLoggerFn
}

let logger: AxiosLogger = {
  debug: console.debug,
  info: console.info,
  error: console.error,
}

export function setLogger(axiosLogger: AxiosLogger): void {
  logger = axiosLogger
}

function getLogMsg({ method, url, baseURL }: AxiosRequestConfig): string {
  return `${ method.toUpperCase() } ${ (baseURL && url.substr(0, baseURL.length) !== baseURL ? baseURL : '') + url }`
}

function getConfigMsg({ url, method, params, data, headers }: AxiosRequestConfig) {
  return { url, method, params, data, headers }
}

function getResponseMsg(response: AxiosResponse) {
  if (!response) {
    return null
  }
  const { data, status, statusText, headers } = response
  return { data, status, statusText, headers }
}

function useInterceptors(axios: Axios): void {
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

useInterceptors(Axios as any)

export { useInterceptors }
