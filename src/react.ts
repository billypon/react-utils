import React from 'react'
import { Observable } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

export class Component<P = unknown, S = unknown> extends React.PureComponent<P, S> {
  constructor(props) {
    super(props)
    this.state = this.getInitialState() as S
  }

  getInitialState(): Partial<S> {
    return { }
  }

  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
  ): Observable<void> {
    const observable = new Observable<void>(observer => {
      super.setState(state, () => {
        observer.next()
        observer.complete()
      })
    }).pipe(shareReplay(1))
    observable.subscribe()
    return observable
  }

  forceUpdate(): Observable<void> {
    const observable = new Observable<void>(observer => {
      super.forceUpdate(() => {
        observer.next()
        observer.complete()
      })
    }).pipe(shareReplay(1))
    observable.subscribe()
    return observable
  }
}
