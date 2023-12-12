export const appMessages = (data?: string | number) => ({
  blogId: 'Blog id',
  user: 'User',
  info: {
    userRegistred: 'User was registered successfully.',
  },
  errors: {
    notFound: `${data} not found`,
    incorrectLikeStatus: 'Is not correct status for like',
    isRequiredField: `${data} is requiered field`,
  },
});
