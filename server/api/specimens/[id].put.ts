import { updateSpecimen } from '~/server/services/specimen-services'
import { schemas, type UpdateSpecimen } from '~/server/db/schema/specimen'

export default defineEventHandler<{ body: UpdateSpecimen }>(async (event) => {
    const { id } = event.context.params as {id: string}
    try {
        const body = await readBody(event)
        const query = getQuery(event)
        const values = schemas.updateSpecimenSchema.parse(body)
        const updatedSpecimen = await updateSpecimen(id, values)
        return updatedSpecimen
    } catch (e: any) {
        throw createError({
            statusCode: 400,
            statusMessage: e.message
        })
    }
})
