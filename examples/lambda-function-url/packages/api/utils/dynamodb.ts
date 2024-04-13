import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { fromIni } from '@aws-sdk/credential-providers'
import type { Entity } from 'dynamodb-toolbox'
import type { Filter } from '@/common/filter'
import { ScanOptions } from 'node_modules/dynamodb-toolbox/dist/esm/classes/Table/types'
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, NODE_ENV } = process.env

const dynamoDbConfig: DynamoDBClientConfig = {
  region: 'us-west-2',
}

// For local development, get creds from ~/.aws/credentials; alternatively, set AWS_PROFILE env var
if (NODE_ENV !== 'test' && (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY)) {
  dynamoDbConfig.credentials = fromIni({ profile: 'todo_development' })
}

export const dynamoDbDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient(dynamoDbConfig))

interface DynamoCreateItemParams {
  entity: Entity
  attributes: any
}

export function dynamoCreateItem({ entity, attributes }: DynamoCreateItemParams) {
  return entity.put(attributes, {
    conditions: [
      {
        attr: entity.schema.keys.partitionKey,
        exists: false,
      },
    ],
  })
}

interface ScanAllParams {
  entity: Entity
  scanOptions?: ScanOptions
  maxPages?: number
  maxItems?: number
  filter?: Filter
}

export async function scanAll({ entity, scanOptions, maxPages = Infinity, maxItems = Infinity, filter }: ScanAllParams) {
  let scanPromise = entity.scan({
    limit: maxItems,
    ...scanOptions,
  })
  let latestScanResult
  let pageIndex = 0
  const items: any[] = []

  do {
    latestScanResult = await scanPromise

    if (latestScanResult.next && latestScanResult.LastEvaluatedKey) {
      scanPromise = latestScanResult.next()
    }

    let data = latestScanResult.Items

    if (filter) {
      const filterOperator = filter.operator ?? 'OR'
      const filterMethod = filterOperator === 'AND' ? 'every' : 'some'
      data = data.filter((datum) => {
        return filter.filters[filterMethod]((f) => `${datum[f.property]}`.toLowerCase().includes(`${f.value}`.toLowerCase()))
      })
    }

    if (data.length) {
      items.push(...data)
    }

    ++pageIndex
  } while (latestScanResult.LastEvaluatedKey && pageIndex < maxPages && items.length < maxItems)

  const itemsLimited = items.slice(0, maxItems)

  return {
    Items: itemsLimited,
    LastEvaluatedKey: latestScanResult.LastEvaluatedKey,
    latestScanResult,
  }
}

export function getAttributesWithout({ attributes, without = [] }: { attributes; without: string[] }): any {
  if (!without.length) return attributes
  const attributesWithout = {}

  Object.entries(attributes).forEach(([k, v]) => {
    if (!without.includes(k)) {
      attributesWithout[k] = v
    }
  })

  return attributesWithout
}
