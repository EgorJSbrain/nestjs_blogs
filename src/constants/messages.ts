export const appMessages = (data?: string | number) => ({
  blogId: 'Blog id',
  postId: 'Post id',
  deviceId: 'Device id',
  commentId: 'Comment id',
  user: 'User',
  post: 'Post',
  blog: 'Blog',
  comment: 'Comment',
  device: 'Device',
  email: 'email',
  code: 'code',
  info: {
    userRegistred: 'User was registered successfully.',
    emailIsUsedYet: 'Email is used yet',
    emailIsConfirmedYet: 'Email is confirmed yet',
    loginIsUsedYet: 'Login is used yet',
  },
  errors: {
    notFound: `${data} not found`,
    incorrectLikeStatus: 'Is not correct status for like',
    isRequiredField: `${data} is requiered field`,
    isRequiredParameter: `${data} is requiered parameter`,
    somethingIsWrong: 'Something is wrong',
    emailIsConfirmed: 'This email is confirmed',
    emailOrPasswordNotCorrect: 'Email or password aren\'t correct',
    emailDoesntExist: 'This email doesn\'t exist',
    codeIsNotCorrect: 'This code isn\'t correct',
  },
});
