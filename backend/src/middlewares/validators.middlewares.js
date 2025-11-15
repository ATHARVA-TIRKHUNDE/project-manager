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

export const validateProjectPermission = (roles = []) => {
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params

    if (!projectId) {
      throw new ApiError(400, 'project id is missing')
    }

    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.user._id),
    })

    if (!project) {
      throw new ApiError(400, 'project not found')
    }

    const givenRole = project?.role

    req.user.role = givenRole

    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action'
      )
    }

    next()
  })
}
