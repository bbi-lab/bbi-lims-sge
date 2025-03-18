import { describe, expect, it } from 'vitest'
import { makePlateDiagram } from '@/composables/lib/plate-diagram'
import _ from 'lodash'

describe('PlateDiagram composable tests', () => {
    it('should create a plate diagram', () => {
        const plateDiagram = makePlateDiagram({x: 5, y: 5})
        expect(plateDiagram.wells()).toHaveLength(25)
    })

    it('should render a plate diagram', () => {
        const plateDiagram = makePlateDiagram({x: 5, y: 5})
        const container = document.createElement('div')
        const plateDiagramRendered = plateDiagram.render(container)
        expect(plateDiagramRendered.wells()).toHaveLength(25)
    })
})
