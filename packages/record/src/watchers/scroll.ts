import { emitterHook, registerEvent, getTime, nodeStore } from '@timecat/utils'
import { WatcherOptions, ScrollRecord, RecordType } from '@timecat/share'

export function ScrollWatcher(options: WatcherOptions<ScrollRecord>) {
    const getCompatibleTarget = (target: Document) => (target.scrollingElement as HTMLElement) || target.documentElement
    const scrollTop = (target: HTMLElement) => target.scrollTop
    const scrollLeft = (target: HTMLElement) => target.scrollLeft
    const { emit, context } = options

    function emitData(target: Element | Document) {
        const element = target instanceof HTMLElement ? target : getCompatibleTarget(target as Document)

        emitterHook(emit, {
            type: RecordType.SCROLL,
            data: {
                id: nodeStore.getNodeId(element) || null, // if null, target is document
                top: scrollTop(element),
                left: scrollLeft(element)
            },
            time: getTime().toString()
        })
    }
    const { scrollingElement } = context.document
    emitData(scrollingElement || document)

    function handleFn(e: Event) {
        const { type, target } = e
        if (type === 'scroll') {
            emitData(target as Element | Document)
        }
    }

    registerEvent({
        context,
        eventTypes: ['scroll'],
        handleFn,
        listenerOptions: { capture: true },
        type: 'throttle',
        optimizeOptions: { leading: true, trailing: true },
        waitTime: 300
    })
}
