import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import { genrateAccessAndRefreshToken, isEmailId } from "../utils/helper.js";
import crypto from "crypto"

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this detials already exist", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification email has been sent on your email",
      ),
    );

})

const loginUser = asyncHandler(async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    throw new ApiError(400, "Login Id or Password are required")
  }

  let user = undefined;

  if (isEmailId(loginId)) {
    user = await User.findOne({ email: loginId });
  } else {
    user = await User.findOne({ username: loginId });
  }

  if (!user) {
    throw new ApiError(400, "User is not registered");
  }

  const isPasswordValid = await User.isPasswordValid(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials")
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id,
  );

  const loggeduser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggeduser,
          accessToken,
          refreshToken,
        },
        "User logged in sucessfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        "User loggedOut scuessfully",
      )
    );
});

const getCurrentUser = asyncHandler( async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current user details feteched sucessfully",
      )
    );
});

const verifyEmail = asyncHandler( async(req, res) => {
  const verificationToken = req.params ;

  if( !verificationToken ) {
    throw new ApiError(
      400,
      "Email verification token is missing",
    )
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken : hashedToken,
    emailVerificationExpiry : { $gt : Date.now() }, 
  });

  if( !user ) {
    throw new ApiError(
      400,
      "Token is invalid or expired",
    )
  };

  user.emailVerificationToken = undefined ;
  user.emailVerificationExpiry = undefined ;

  user.isEmailVerified = true ;

  await User.save({validateBeforeSave: false}) ;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,
      },
      "Email verified sucessfully",
    )
  )

});

const resendEmailVerification = asyncHandler( async(req, res) => {
  // code
});

const refreshAccessToken = asyncHandler( async(req, res) => {
  // code
});

const forgotPasswordRequest = asyncHandler( async(req, res) => {
  // code
});

const changeCurrentPassword = asyncHandler( async(req, res) => {
  // code
});

const resetForgotPassword = asyncHandler( async(req, res) => {
  // code
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  changeCurrentPassword,
  resetForgotPassword,
};

