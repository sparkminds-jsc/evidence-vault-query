
export interface Customer {
  id: string
  email: string
  full_name: string
  status: string
}

export interface QuestionOperationsState {
  loadingAnswers: Set<string>
  loadingRemediations: Set<string>
  loadingEvaluations: Set<string>
  loadingFeedbackEvaluations: Set<string>
  deletingQuestions: Set<string>
  isDeletingAll: boolean
}

export interface QuestionOperationsActions {
  handleGetAnswer: (questionId: string, questionContent: string) => Promise<void>
  handleGetRemediation: (questionId: string, questionContent: string) => Promise<void>
  handleGetEvaluation: (questionId: string) => Promise<void>
  handleGetFeedbackEvaluation: (questionId: string) => Promise<void>
  handleDeleteQuestion: (questionId: string) => Promise<void>
  handleDeleteAllQuestions: () => Promise<void>
}

export type QuestionOperationsReturn = QuestionOperationsState & QuestionOperationsActions
