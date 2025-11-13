import { body } from 'express-validator'
import { AvailableUserRole } from '../utils/constant.js'

const userRegisterValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is Invalid'),

    body('username')
      .trim()
      .notEmpty.withMessage('Username is required')
      .isLength({ min: 5 })
      .withMessage('Usernmae must have at least 5 characters')
      .islowercase()
      .withMessage('Username must be in lower case'),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must have at least 8 characters long')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      ),

    body('role')
      .optional()
      .notEmpty()
      .withMessage('Role is required')
      .isIn(AvailableUserRole)
      .withMessage('Role is invalid'),
  ]
}

const userLoginValidator = () => {
  return [
    body('loginId')
      .trim()
      .notEmpty()
      .withMessage('Login ID (Username or Email) is required.')
      .custom((value) => {
        // Check if the value is a valid email using express-validator's built-in isEmail()
        const isEmail = body('email')
          .isEmail()
          .run({ body: { email: value } })
          .then((result) => result.array().length === 0)

        // Check if the value is a valid username using the regex defined above
        const isUsername = usernameRegex.test(value)

        // If it's neither a valid email NOR a valid username, throw an error.
        if (!isEmail && !isUsername) {
          // This message is only for formatting errors, not for checking if the user exists
          throw new Error(
            'Login ID must be a valid email or a valid username (3-20 characters, alphanumeric).'
          )
        }
        return true
      }),

    body('password').notEmpty().withMessage('Password is required'),
  ]
}

const userForgotPasswordValidator = () => {
  return [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid'),
  ]
}

const userChangeCurrentPasswordValidator = () => {
  return [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').notEmpty().withMessage('New password is required'),
  ]
}

const userResetForgotPasswordValidator = () => {
  return [body('newPassword').notEmpty().withMessage('Password is required')]
}

export {
  userLoginValidator,
  userRegisterValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  userChangeCurrentPasswordValidator,
}
