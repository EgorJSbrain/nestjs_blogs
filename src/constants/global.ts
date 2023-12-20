export const LOGIN_MIN_LENGTH = 3;
export const LOGIN_MAX_LENGTH = 10;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 20;
export const STRING_MAX_LENGTH = 255;
export const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).+$/;
export const EMAIL_REGEX =
  /^(?!.*[.!#$%&'*+/=?^_`{|}~-]{2,})(?![.!#$%&'*+/=?^_`{|}~-])(^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64})+(?<![.!#$%&'*+/=?^_`{|}~-])@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

export enum RoutesEnum {
  blogs = 'blogs',
  posts = 'posts',
  users = 'users',
  comments = 'comments',
  devices = 'security/devices',
  testing_all_data = 'testing/all-data'
}