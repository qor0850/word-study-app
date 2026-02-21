import { createContext, useContext } from "react";

export interface StudyContextType {
  /** 0 = TOEIC (shared), 1-10 = personal user */
  userId: number;
  /** Base URL for this learning section, e.g. "/toeic" or "/personal/3" */
  basePath: string;
}

export const StudyContext = createContext<StudyContextType>({
  userId: 0,
  basePath: "/toeic",
});

export function useStudyContext(): StudyContextType {
  return useContext(StudyContext);
}
