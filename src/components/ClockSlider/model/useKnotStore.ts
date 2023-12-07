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
          draft.knots.splice(0, 1)
          draft.knots.push(payload)          
        }
        isOkay && isOkay(true)
      }),
    ),
  peek: (payload) => {
    const itknots = get().knots
    const found = itknots.find((y) => y.index == payload)
    if (found) return found

    return null
  },
  isInbound: (payload) => {
    const itknots = get().knots
    if (itknots.length > 1) {
      const lastknot = itknots[itknots.length - 1]
      const prevknot = itknots[itknots.length-2]
      const angleInDifflast =  payload.angleDeg- lastknot.angleDeg
      const angleInDiffprev =  lastknot.angleDeg- prevknot.angleDeg

      console.log(`load : ${payload.angleDeg} last: ${lastknot.angleDeg} prev: ${prevknot.angleDeg}`)

      if(angleInDifflast< 0 && angleInDifflast+360 < 150)
      {
        
        return false
      }
      if( angleInDifflast > 150 && angleInDiffprev < 0)
      {
        return true;
      }

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
