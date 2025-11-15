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
        const isEmail = body('email')
          .isEmail()
          .run({ body: { email: value } })
          .then((result) => result.array().length === 0)

        const isUsername = usernameRegex.test(value)

        if (!isEmail && !isUsername) {
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

const createProjectValidator = () => {
  return [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional(),
  ]
}

const addMembertoProjectValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid'),
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(AvailableUserRole)
      .withMessage('Role is invalid'),
  ]
}

export {
  userLoginValidator,
  userRegisterValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  userChangeCurrentPasswordValidator,
  createProjectValidator,
  addMembertoProjectValidator,
}
