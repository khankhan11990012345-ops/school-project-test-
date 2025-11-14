import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRE || '7d';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign({ id }, secret, { expiresIn } as any) as string;
};

