// src/utils/constants.js
export const ENDPOINTS = {
  // Auth
  LOGIN:              '/api/auth/login',
  REGISTER:           '/api/auth/register',
  REGISTER_VALIDATE:  '/api/auth/register/validate',   // NEW: checks details, saves nothing
  REGISTER_COMPLETE:  '/api/auth/register/complete',   // NEW: registration + both tests, saved together
  LOGOUT:             '/api/auth/logout',
  ME:                 '/api/auth/me', 

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