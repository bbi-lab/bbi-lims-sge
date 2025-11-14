import { describe, expect, it } from 'vitest'
import { makePlateDiagram } from '~/lib/plate-diagram'
import _ from 'lodash'

describe('PlateDiagram composable tests', () => {
    it('should create a 5x5 plate diagram', () => {
        const wells = _.range(0, 25).map((i) => ({
            x: i,
            y: 0,
            id: `${i}`,
            amplificationPrimerId: null,
            linearizationPrimerId: null,
            homologyArmPrimerId: null,
        }))
        const plateDiagram = makePlateDiagram('seq-index', 5, 5).wells(wells)
        expect(plateDiagram.getWells()).toHaveLength(25)
    })

    it('should render a plate diagram', () => {
        const plateDiagram = makePlateDiagram('seq-index')
        const container = document.createElement('div')
        const plateDiagramRendered = plateDiagram.render(container)
        expect(container.querySelector('.plate-diagram-nodes')).not.toBeNull()
    })
})
