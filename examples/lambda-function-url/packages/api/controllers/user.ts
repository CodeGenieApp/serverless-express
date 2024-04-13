import { Filter } from '@/common/filter'
import User from '../models/User'
import { generateId } from '../utils/id'
import { log } from '../utils/logger'
import { dynamoCreateItem, getAttributesWithout, scanAll } from '../utils/dynamodb'
import { DEFAULT_PAGE_SIZE } from '../../common/pagination'

const READ_ONLY_ATTRIBUTES = [
  'userId',
]
const IMMUTABLE_ATTRIBUTES = [...READ_ONLY_ATTRIBUTES]

export async function createUser({
  user,
  userId = generateId(),
}) {
  const attributes = getAttributesWithout({ attributes: user, without: READ_ONLY_ATTRIBUTES })
  attributes.userId = userId

  await dynamoCreateItem({
    entity: User,
    attributes,
  })

  log.info('api.controller.User.create', { attributes })

  return { data: attributes }
}

export async function updateUser({
  userId,
  user,
}) {
  const attributes = getAttributesWithout({ attributes: user, without: IMMUTABLE_ATTRIBUTES })
  attributes.userId = userId
  const userItem = await User.update(attributes, { returnValues: 'ALL_NEW' })

  log.info('api.controller.User.update', { userItem })

  return userItem.Attributes
}

export async function getUser({
  userId,
}) {
  const user = await User.get({ userId })
  const userItem = user?.Item

  if (!userItem) return null

  const data = userItem

  return { data }
}

export interface ListUsersLastEvaluatedKey {
  userId: string
}

interface ListUsersParams {
  lastEvaluatedKey?: ListUsersLastEvaluatedKey
  filter?: Filter
}

export async function listUsers({
  lastEvaluatedKey,
  filter,
}: ListUsersParams = {}) {
  const userScanResponse = await scanAll({
    entity: User,
    scanOptions: {
      startKey: lastEvaluatedKey,
    },
    maxItems: DEFAULT_PAGE_SIZE,
    maxPages: 10,
    filter,
  })

  return {
    data: userScanResponse.Items,
    lastEvaluatedKey: userScanResponse.LastEvaluatedKey,
  }
}

export async function deleteUser({
  userId,
}) {
  const itemToDeleteKey = { userId }

  const user = await User.get(itemToDeleteKey)

  if (!user) return null

  return User.delete(itemToDeleteKey)
}

export async function getCurrentUser(req) {
  if (!req) throw new Error('req is required')

  const currentUser = await getUser({
    userId: req.cognitoUser.userId,
  })

  if (!currentUser) throw new Error(`Couldn't find current user ${req.cognitoUser.userId}`)

  return currentUser
}
