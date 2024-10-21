
import { specimens } from '~/server/db/schema/specimen'
import { db } from '~/server/utils/db'

export async function getAllSpecimens() {
    return await db.select().from(specimens)
}
