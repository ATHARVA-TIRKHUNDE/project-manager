import { asyncHandler } from '../utils/async-handler.js'
import { ProjectMember } from '../models/projectmember.models.js'
import { ApiResponse } from '../utils/api-response.js'
import { ApiError } from '../utils/api-error.js'
import { Project } from '../models/project.models.js'
import mongoose from 'mongoose'
import { AvailableUserRole, UserRolesEnum } from '../utils/constant.js'
import { User } from '../models/user.models.js'

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: 'Project',
        localField: 'project',
        foreignField: '_id',
        as: 'projectDetails',
        pipeline: [
          {
            $lookup: {
              from: 'ProjectMember',
              localField: '_id',
              foreignField: 'project',
              as: 'projectmembers',
            },
          },
          {
            $addFields: {
              totalmembers: {
                $size: '$projectmembers',
              },
            },
          },
        ],
      },
    },
    {
      $unwind: '$projectDetails',
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: '$projects.totalmembers',
          createdAt: '$projects.createdAt',
          createdBy: '$projects.createdBy',
        },
        role: 1,
        _id: 0,
      },
    },
  ])

  if (!projects) {
    throw new ApiError(404, 'Projects not found', [])
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projects, 'Project details fetched sucessfully'))
})

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  const project = await ProjectMember.findById(projectId)

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  return res.status(200).json(200, project, 'Project fetched sucessfully')
})

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const project = await Project.findById(req.params)

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.ObjectId(projectId),
      },
    },

    {
      $lookup: {
        from: 'User',
        localField: 'user',
        foreignField: '_id',
        as: 'usersDetails',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              avatar: 1,
              role: 1,
              email: 1,
            },
          },
        ],
      },
    },

    {
      $unwind: '$usersDetails',
    },

    {
      $project: {
        _id: 1,
        project: 1,
        role: 1,
        joinedAt: '$createdAt',
        user: '$usersDetails',
      },
    },
  ])

  return res
    .status(200)
    .json(new ApiResponse(200, projectMembers, 'Project members fetched'))
})

const createProjects = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  const project = new Project.create({
    name,
    description,
    createdBy: new mongoose.ObjectId(req.user?._id),
  })

  if (!project) {
    throw new ApiError(401, 'Project not created')
  }

  await ProjectMember.create({
    user: new mongoose.ObjectId(req.user?._id),
    project: new mongoose.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  })

  return res
    .status(200)
    .json(new ApiResponse(200, project, 'Project create sucessfully'))
})

const updateProjects = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  const { projectId } = req.params

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    {
      new: true,
    }
  )

  if (!project) {
    throw new ApiError(404, 'Update: Project not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, 'Project updated sucessfully'))
})

const deleteProjects = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!projectId) {
    throw new ApiError(404, 'Delete: Project Id not found')
  }

  const project = await Project.findByIdAndDelete(projectId)

  if (!project) {
    throw new ApiError(404, 'Delete: Project not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, 'Project Deleted sucessfully'))
})

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body
  const { projectId } = req.params

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, 'User does not exist.')
  }

  const member = await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.ObjectId(user._id),
      project: new mongoose.ObjectId(projectId),
    },
    {
      user: new mongoose.ObjectId(user._id),
      project: new mongoose.ObjectId(projectId),
      role: role,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  )

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        member,
        `Project member added/updated successfully to project ${projectId}.`
      )
    )
})

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params
  const { newRole } = req.body

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, 'Invalid Role')
  }

  let projectMember = await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.ObjectId(userId),
      project: new mongoose.ObjectId(projectId),
    },
    {
      role: newRole,
    },
    {
      new: true,
    }
  )

  if (!projectMember) {
    throw new ApiError(400, 'Project member not found')
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        'Project member role updated successfully'
      )
    )
})

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params

  const projectMember = await ProjectMember.findOneAndDelete({
    user: new mongoose.ObjectId(userId),
    project: new mongoose.ObjectId(projectId),
  })

  if (!projectMember) {
    throw new ApiError(404, 'Project member not found')
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, projectMember, 'Project member deleted successfully')
    )
})

export {
  getProjects,
  getProjectById,
  getProjectMembers,
  createProjects,
  updateMemberRole,
  updateProjects,
  deleteMember,
  deleteProjects,
  addMembersToProject,
}
