import { Router } from 'express'

import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from '../controllers/auth.controllers.js'
import { userChangeCurrentPasswordValidator, userForgotPasswordValidator, userLoginValidator, userRegisterValidator, userResetForgotPasswordValidator } from '../validators/index.js'
import { validate } from '../middlewares/validators.middlewares.js'

const router = Router()

router.route('/register').post(userRegisterValidator(), validate, registerUser)
router.route('/verify-email/:verificationToken').get(verifyEmail)
router.route('/login').post(userLoginValidator(), validate, loginUser)

router.route('/forgot-password').post(userForgotPasswordValidator(), validate, forgotPasswordRequest)
router.route('/reset-password/:resetToken').post(userResetForgotPasswordValidator(), validate, resetForgotPassword)
router.route('/refresh-token').post(refreshAccessToken)


// Protected Routes
router.route('/profile').get(getCurrentUser)
router.route('/logout').post(logoutUser)
router.route('/change-password').post(userChangeCurrentPasswordValidator(), validate, changeCurrentPassword)
router.route('/resend-email-verification').post(resendEmailVerification)

export default router
