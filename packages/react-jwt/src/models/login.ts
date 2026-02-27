/**
 * 로그인에 필요한 자격 증명 인터페이스
 * @example
 * ```tsx
 * const loginSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(6),
 * });
 *
 * type MyLoginCredentials = z.infer<typeof loginSchema>;
 *
 * declare module "@justkits/react-jwt" {
 *   interface LoginCredentials extends MyLoginCredentials {}
 * }
 * ```
 */

export interface LoginCredentials {} // eslint-disable-line @typescript-eslint/no-empty-object-type
