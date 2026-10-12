'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

type Identity = {
  workspaceName: string | null
  userName: string | null
  userEmail: string | null
  userImage: string | null
}

const WorkspaceContext = createContext<Identity>({
  workspaceName: null,
  userName: null,
  userEmail: null,
  userImage: null
})

export const useWorkspaceIdentity = () => useContext(WorkspaceContext)

export default function WorkspaceIdentity({ children, value }: { children: ReactNode; value: Identity }) {
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
