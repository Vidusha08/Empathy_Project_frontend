export const ENDPOINTS = {
  // Auth
  LOGIN:              '/api/auth/login',
  REGISTER:           '/api/auth/register',
  LOGOUT:             '/api/auth/logout',
  ME:                 '/api/auth/me',       // ← ADD THIS

  // Assessment
  PRE_ASSESSMENT:     '/api/assessment/pre',
  POST_ASSESSMENT:    '/api/assessment/post',

  // Chat
  CHAT_SEND:       '/api/chat/message',
  CHAT_HISTORY:    '/api/chat/history',

  // Quiz
  QUIZ_GET:           '/api/quiz',
  QUIZ_SUBMIT:        '/api/quiz/submit',

  // Progress
  PROGRESS_REPORT:    '/api/progress/report',
};