// Fixes TS error: error TS2339: Property 'cognitoUser' does not exist on type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
interface CognitoUser {
  userId: string
  email: string
  groups: any
}

declare namespace Express {
  export interface Request {
    cognitoUser: CognitoUser;
  }
}