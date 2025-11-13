import { validationResult } from 'express-validator'
import { ApiError } from '../utils/api-error.js'

export const validate = (rea, res, next) => {
  const errors = validationResult(res)
  if (errors.isEmpty()) {
    return next()
  }

  const extractedErrors = []
  errors.array().map((err) =>
    extractedErrors.push({
      [err.path]: err.msg,
    })
  )

  throw new ApiError(422, ' Received data is not valid', extractedErrors)
}
