export const getWhatsappTemplateVariableIndexes = (bodyText: string) => {
  const indexes = new Set<number>()
  const variablePattern = /\{\{(\d+)\}\}/g
  let match: RegExpExecArray | null

  while ((match = variablePattern.exec(bodyText))) {
    indexes.add(Number(match[1]))
  }

  return Array.from(indexes).sort((left, right) => left - right)
}

export const renderWhatsappTemplateBody = (bodyText: string, variables: string[]) => {
  let renderedBody = bodyText

  getWhatsappTemplateVariableIndexes(bodyText).forEach((variableIndex, index) => {
    renderedBody = renderedBody.replaceAll(`{{${variableIndex}}}`, variables[index] ?? '')
  })

  return renderedBody
}
