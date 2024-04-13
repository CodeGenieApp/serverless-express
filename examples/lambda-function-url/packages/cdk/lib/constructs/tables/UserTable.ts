import { Construct } from 'constructs'
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { CfnOutput } from 'aws-cdk-lib'
import BaseTable from '../BaseTable'

export default class UserTable extends Construct {
  public readonly table: TableV2

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const baseTable = new BaseTable(this, 'Table', {
      partitionKey: { name: 'userId', type: AttributeType.STRING },
    })

    this.table = baseTable.table
    
    new CfnOutput(this, 'UserTable', { key: 'UserTable', value: this.table.tableName })
  }
}