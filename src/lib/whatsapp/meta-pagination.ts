type MetaPaginationResponse = {
  paging?: {
    next?: string
    cursors?: {
      after?: string
    }
  }
}

export const getNextMetaPageCursor = (currentCursor: string | null, response: MetaPaginationResponse) => {
  const nextCursor = response.paging?.cursors?.after?.trim() || null

  if (!response.paging?.next || !nextCursor || nextCursor === currentCursor) return null

  return nextCursor
}
