export const appMessages = (data?: string | number) => ({
  info: {
    userRegistred: 'User was registered successfully.',
  },
  errors: {
    dontFound: `${data} not found`,
  },
});
