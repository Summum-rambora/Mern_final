export const hash = jest.fn().mockResolvedValue('hashed_password');
export const compare = jest.fn().mockResolvedValue(true);