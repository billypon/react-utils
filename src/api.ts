import { AxiosObservable } from 'axios-observable/lib/axios-observable.interface'
import { Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { ObservablePipe } from '@billypon/rxjs-types'
import { Dictionary } from '@billypon/ts-types'
import 'reflect-metadata'

import { parseResponse } from './ajax'

const meta = Symbol('api')

function getSymbol(target: Function): symbol {
  return Reflect.getMetadata(meta, target) || Symbol('class')
}

export type GetBaseUrlFn = () => string

export type GetPipesFn = (options: Dictionary) => ObservablePipe[]

export interface ApiClassOptions {
  port: number
  getBaseUrl?: GetBaseUrlFn
  getPipes?: GetPipesFn
}

export function ApiClass({ port, getBaseUrl, getPipes }: ApiClassOptions) {
  return (target: Function) => {
    const symbol = getSymbol(target)
    const { prototype } = target
    Object.getOwnPropertyNames(prototype).filter(x => x !== 'constructor').forEach(x => {
      const opts: Dictionary = Reflect.getMetadata(symbol, target, x) || { }
      const pipes = getPipes ? getPipes(opts) : [ ]
      const fn = prototype[x]
      prototype[x] = function () {
        const observable: AxiosObservable<unknown> = fn.apply(this, arguments)
        return observable.pipe.apply(observable, [ parseResponse, ...pipes ])
      }
    })
    prototype.getBaseUrl = getBaseUrl || (() => '')
  }
}

export function ApiCall(opts: Dictionary = { }) {
  return function (target: Function, name: string) {
    const symbol = getSymbol(target.constructor)
    Reflect.defineMetadata(symbol, opts, target.constructor, name)
  }
}
