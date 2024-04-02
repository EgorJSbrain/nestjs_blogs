export const LOGIN_MIN_LENGTH = 3;
export const LOGIN_MAX_LENGTH = 10;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 20;
export const STRING_MIN_LENGTH = 20;
export const STRING_MAX_LENGTH = 255;
export const IMG_MAX_SIZE = 100000;
export const IMG_MAX_WIDTH = 1028;
export const IMG_MAX_HEIGHT = 312;
export const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).+$/;
export const EMAIL_REGEX =
  /^(?!.*[.!#$%&'*+/=?^_`{|}~-]{2,})(?![.!#$%&'*+/=?^_`{|}~-])(^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64})+(?<![.!#$%&'*+/=?^_`{|}~-])@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

export enum RoutesEnum {
  auth = 'auth',
  saBlogs = 'sa/blogs',
  saQuizQuestions = 'sa/quiz/questions',
  pairGameQuiz = 'pair-game-quiz',
  blogs = 'blogs',
  blogger = 'blogger',
  posts = 'posts',
  saUsers = 'sa/users',
  users = 'users',
  comments = 'comments',
  devices = 'security/devices',
  testing_all_data = 'testing/all-data'
}

export enum SortDirectionsEnum {
  asc = 'asc',
  desc = 'desc'
}

export const SortDirections: Record<SortDirectionsEnum, SortType> = {
  asc: 'ASC',
  desc: 'DESC'
}

export type SortType = 'ASC' | 'DESC' | undefined