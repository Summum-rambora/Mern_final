export const sign = jest.fn().mockReturnValue('mocked-jwt-token');
export const verify = jest.fn().mockReturnValue({ id: 'user123' });