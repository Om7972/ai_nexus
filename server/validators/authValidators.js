import { z } from 'zod';

// ── Shared building blocks ────────────────────────────────────────────────────

const nameSchema = z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters');

const emailSchema = z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim();

const passwordSchema = z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const tokenSchema = z
    .string({ required_error: 'Token is required' })
    .min(1, 'Token cannot be empty');

// ══════════════════════════════════════════════════════════════════════════════
// Auth Schemas
// ══════════════════════════════════════════════════════════════════════════════

/** POST /auth/register */
export const registerSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string({ required_error: 'Please confirm your password' }),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

/** POST /auth/login */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

/** POST /auth/forgot-password */
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

/** POST /auth/reset-password/:token */
export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string({ required_error: 'Please confirm your password' }),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

/** PATCH /auth/change-password */
export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({ required_error: 'Current password is required' })
            .min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmNewPassword: z.string({ required_error: 'Please confirm your new password' }),
    })
    .refine((d) => d.newPassword === d.confirmNewPassword, {
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
    })
    .refine((d) => d.currentPassword !== d.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    });

/** GET /auth/verify-email/:token */
export const verifyEmailSchema = z.object({
    token: tokenSchema,
});
