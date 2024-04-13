import { StatusCodes } from 'http-status-codes'
import type { Request, Response } from 'express'

interface TryParseReqParams {
  req: Request
  res: Response
  key: string
}

export default function tryParseReq({ req, res, key }: TryParseReqParams): any | undefined | Response {
  const value = req.query[key]

  if (!value) return

  try {
    return JSON.parse(value as string)
  } catch(error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        error: `Invalid ${key}`,
      })
  }
}