import create from 'zustand'
import { Draft, produce } from 'immer'
import { KnotState } from 'src/config/types'

export const useKnotStore = create<KnotState>((set, get) => ({
  knots: [],
  count: 3,
  push: (payload, isOkay) =>
    set(
      produce((draft: Draft<Pick<KnotState, 'knots' | 'count'>>) => {
        if (draft.knots.length > 0) {
          // try to skip the duplicate
          if (draft.knots[draft.knots.length - 1].angleDeg == payload.angleDeg) {
            isOkay && isOkay(false)
            return
          }
        }

        if (draft.knots.length < draft.count) {
          draft.knots.push(payload)
        } else {
          draft.knots.slice()
          draft.knots.push(payload)
        }
        isOkay && isOkay(true)
      }),
    ),
  peek: (payload) => {
    if (payload < get().knots.length) return get().knots[payload]
    return null
  },
  isInbound: (payload) => {
    const itknots = get().knots
    if (itknots.length > 1) {
      const lastknot = itknots[itknots.length - 1]
      return lastknot.angleDeg > payload.angleDeg
    }
    return false
  },
  noMove: (payload) => {
    const itknots = get().knots
    if (itknots.length > 0) {
      return itknots[itknots.length - 1].angleDeg == payload.angleDeg
    }
    return false
  },
  getNewIndex: () => {
    const itknots = get().knots
    if (itknots.length == 0) return 0
    else {
      return itknots[itknots.length - 1].index + 1
    }
  },
}))
