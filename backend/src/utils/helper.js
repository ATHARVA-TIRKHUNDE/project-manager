import { User } from '../models/user.models.js'
import { ApiError } from './api-error.js'

export const isEmailId = (loginId) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(loginId)
}

export const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = User.generateAccessToken()
    const refreshToken = User.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, 'Somthng went wrong while generating access token')
  }
}
