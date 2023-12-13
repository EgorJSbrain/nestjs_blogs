export const appMessages = (data?: string | number) => ({
  blogId: 'Blog id',
  postId: 'Post id',
  user: 'User',
  post: 'Post',
  blog: 'Blog',
  info: {
    userRegistred: 'User was registered successfully.',
  },
  errors: {
    notFound: `${data} not found`,
    incorrectLikeStatus: 'Is not correct status for like',
    isRequiredField: `${data} is requiered field`,
    somethingIsWrong: 'Something is wrong',
  },
});
