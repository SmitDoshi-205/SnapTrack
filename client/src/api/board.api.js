import api from './axios.js'

export const boardApi = {
  // Boards
  getAll:       ()           => api.get('/boards'),
  getOne:       (id)         => api.get(`/boards/${id}`),
  create:       (data)       => api.post('/boards', data),
  update:       (id, data)   => api.patch(`/boards/${id}`, data),
  delete:       (id)         => api.delete(`/boards/${id}`),
  join:         (code)       => api.post(`/boards/join/${code}`),
  removeMember: (id, userId) => api.delete(`/boards/${id}/members/${userId}`),

  // Columns
  createColumn:   (boardId, data)    => api.post(`/boards/${boardId}/columns`, data),
  updateColumn:   (id, data)         => api.patch(`/columns/${id}`, data),
  deleteColumn:   (id)               => api.delete(`/columns/${id}`),
  reorderColumns: (boardId, columns) => api.patch(`/boards/${boardId}/columns/reorder`, { columns }),

  // Tasks
  createTask: (columnId, data) => api.post(`/columns/${columnId}/tasks`, data),
  getTask:    (id)             => api.get(`/tasks/${id}`),
  updateTask: (id, data)       => api.patch(`/tasks/${id}`, data),
  deleteTask: (id)             => api.delete(`/tasks/${id}`),
  moveTask:   (id, data)       => api.patch(`/tasks/${id}/move`, data),

  // Comments
  getComments:   (taskId)       => api.get(`/tasks/${taskId}/comments`),
  createComment: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  deleteComment: (id)           => api.delete(`/comments/${id}`),
}