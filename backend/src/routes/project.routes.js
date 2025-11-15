import { Router } from 'express'
import {
  addMembersToProject,
  createProjects,
  deleteMember,
  deleteProjects,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProjects,
} from '../controllers/project.controllers.js'
import {
  addMembertoProjectValidator,
  createProjectValidator,
} from '../validators/index.js'
import {
  validate,
  validateProjectPermission,
} from '../middlewares/validators.middlewares.js'
import { AvailableUserRole, UserRolesEnum } from '../utils/constant.js'
const router = Router()

router
  .route('/')
  .get(getProjects)
  .post(createProjectValidator(), validate, createProjects)

router
  .route('/:projectId')
  .get(validateProjectPermission(AvailableUserRole), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProjects
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProjects)

router
  .route('/:projectId/members')
  .get(getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMembertoProjectValidator(),
    validate,
    addMembersToProject
  )

router
  .route('/:projectId/members/:userId')
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember)

export default router
