import prisma from '@/lib/prisma'

export const deleteUserAccount = async (userId: string) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true
    }
  })

  if (!existingUser) {
    return {
      deleted: false
    }
  }

  await prisma.user.delete({
    where: {
      id: userId
    }
  })

  return {
    deleted: true,
    email: existingUser.email
  }
}
