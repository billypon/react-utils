import { AxiosObservable } from 'axios-observable/lib/axios-observable.interface'
import { Observable, MonoTypeOperatorFunction } from 'rxjs'
import { tap, map } from 'rxjs/operators'

export function parseResponse<T = unknown>(observable: AxiosObservable<T>): Observable<T> {
  return observable.pipe(map(({ data }) => data))
}

export function checkCode(checker: (result: any) => boolean, callback: (result: any) => void): MonoTypeOperatorFunction<any> {
  return (observable: Observable<unknown>) => {
    return observable.pipe(tap(null, result => {
      if (result && checker(result)) {
        callback(result)
      }
    }))
  }
}
