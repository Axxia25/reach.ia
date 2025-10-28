import { z } from 'zod'

/**
 * Schemas de Validação para Usuários e Autenticação
 *
 * Valida dados de entrada para registro, login e gerenciamento de usuários
 */

// Regex para validação de senha forte
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/

// Regex para validação de email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Schema para registro de novo usuário
 */
export const registerUserSchema = z
  .object({
    email: z
      .string({ message: 'Email deve ser uma string' })
      .email('Email inválido')
      .regex(emailRegex, 'Formato de email inválido')
      .min(5, 'Email deve ter pelo menos 5 caracteres')
      .max(255, 'Email deve ter no máximo 255 caracteres')
      .toLowerCase()
      .trim(),

    password: z
      .string({ message: 'Senha deve ser uma string' })
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(
        strongPasswordRegex,
        'Senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial (@$!%*?&#)'
      ),

    confirmPassword: z.string({ message: 'Confirmação de senha é obrigatória' }),

    vendedor_name: z
      .string({ message: 'Nome do vendedor deve ser uma string' })
      .min(2, 'Nome do vendedor deve ter pelo menos 2 caracteres')
      .max(255, 'Nome do vendedor deve ter no máximo 255 caracteres')
      .trim(),

    role: z
      .enum(['vendedor', 'gerente', 'admin'], {
        message: 'Role deve ser: vendedor, gerente ou admin',
      })
      .default('vendedor'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

/**
 * Schema para login de usuário
 */
export const loginUserSchema = z.object({
  email: z
    .string({ message: 'Email deve ser uma string' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: 'Senha deve ser uma string' })
    .min(1, 'Senha não pode ser vazia'),
})

/**
 * Schema para atualização de perfil de usuário
 */
export const updateUserProfileSchema = z.object({
  id: z
    .string({ message: 'ID deve ser uma string UUID' })
    .uuid('ID deve ser um UUID válido'),

  vendedor_name: z
    .string()
    .min(2, 'Nome do vendedor deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do vendedor deve ter no máximo 255 caracteres')
    .trim()
    .optional(),

  role: z
    .enum(['vendedor', 'gerente', 'admin'], {
      message: 'Role deve ser: vendedor, gerente ou admin',
    })
    .optional(),

  avatar_url: z
    .string()
    .url('Avatar URL deve ser uma URL válida')
    .max(500, 'Avatar URL deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),

  phone: z
    .string()
    .regex(
      /^(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}$/,
      'Telefone inválido'
    )
    .optional()
    .nullable(),
})

/**
 * Schema para alteração de senha
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ message: 'Senha atual é obrigatória' })
      .min(1, 'Senha atual não pode ser vazia'),

    newPassword: z
      .string({ message: 'Nova senha é obrigatória' })
      .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
      .max(100, 'Nova senha deve ter no máximo 100 caracteres')
      .regex(
        strongPasswordRegex,
        'Nova senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial'
      ),

    confirmNewPassword: z.string({ message: 'Confirmação de nova senha é obrigatória' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Nova senha deve ser diferente da senha atual',
    path: ['newPassword'],
  })

/**
 * Schema para recuperação de senha
 */
export const resetPasswordSchema = z.object({
  email: z
    .string({ message: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase()
    .trim(),
})

/**
 * Schema para redefinir senha com token
 */
export const setNewPasswordSchema = z
  .object({
    token: z
      .string({ message: 'Token é obrigatório' })
      .min(1, 'Token não pode ser vazio'),

    newPassword: z
      .string({ message: 'Nova senha é obrigatória' })
      .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
      .max(100, 'Nova senha deve ter no máximo 100 caracteres')
      .regex(
        strongPasswordRegex,
        'Nova senha deve conter: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial'
      ),

    confirmNewPassword: z.string({ message: 'Confirmação de nova senha é obrigatória' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmNewPassword'],
  })

/**
 * Schema para busca/listagem de usuários (admin)
 */
export const listUsersSchema = z.object({
  role: z
    .enum(['vendedor', 'gerente', 'admin'])
    .optional(),

  search: z
    .string()
    .max(255, 'Termo de busca deve ter no máximo 255 caracteres')
    .optional(),

  limit: z
    .number()
    .int('Limite deve ser um número inteiro')
    .positive('Limite deve ser positivo')
    .max(100, 'Limite máximo é 100 registros')
    .default(50)
    .optional(),

  offset: z
    .number()
    .int('Offset deve ser um número inteiro')
    .min(0, 'Offset deve ser maior ou igual a zero')
    .default(0)
    .optional(),
})

/**
 * Schema para deleção de usuário (admin)
 */
export const deleteUserSchema = z.object({
  id: z
    .string({ message: 'ID do usuário é obrigatório' })
    .uuid('ID deve ser um UUID válido'),
})

/**
 * Schema para verificação de email
 */
export const verifyEmailSchema = z.object({
  token: z
    .string({ message: 'Token de verificação é obrigatório' })
    .min(1, 'Token não pode ser vazio'),
})

// Tipos TypeScript inferidos dos schemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type SetNewPasswordInput = z.infer<typeof setNewPasswordSchema>
export type ListUsersInput = z.infer<typeof listUsersSchema>
export type DeleteUserInput = z.infer<typeof deleteUserSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
