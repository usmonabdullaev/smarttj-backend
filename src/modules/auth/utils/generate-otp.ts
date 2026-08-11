import { generateCode, CodeLength } from 'patcode';

export const generateOtp = (length: CodeLength = 4) => {
  return generateCode({ length });
};
