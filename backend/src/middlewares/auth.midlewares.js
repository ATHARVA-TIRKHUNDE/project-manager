import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/async-handler.js'
import { ApiError } from '../utils/api-error.js'
import { User } from '../models/user.models.js'

const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new ApiError(401, 'Unauthorized access')
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationExpiry'
    )

    if (!user) {
      throw new ApiError(401, 'Invalid access token')
    }

    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, 'Invalid access token')
  }
})

const validateProjectPermission = asyncHandler((req, res, next) => {})

export { verifyJwt, validateProjectPermission }
