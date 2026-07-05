const { validationResult } = require('express-validator');
const httpMocks = require('node-mocks-http');
const { registerValidation, taskValidation } = require('../utils/validators');

// Helper: runs an array of express-validator middlewares against a fake request
const runValidations = async (validations, body) => {
  const req = httpMocks.createRequest({ body });
  const res = httpMocks.createResponse();
  for (const validation of validations) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => validation(req, res, resolve));
  }
  return { req, res };
};

describe('registerValidation', () => {
  it('rejects a password without an uppercase letter', async () => {
    const validations = registerValidation.slice(0, -1); // exclude handleValidation
    const { req } = await runValidations(validations, {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'lowercase1',
      confirmPassword: 'lowercase1',
      role: 'Employee',
    });
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  it('rejects mismatched confirmPassword', async () => {
    const validations = registerValidation.slice(0, -1);
    const { req } = await runValidations(validations, {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password1',
      confirmPassword: 'Password2',
      role: 'Employee',
    });
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  it('accepts a valid registration payload', async () => {
    const validations = registerValidation.slice(0, -1);
    const { req } = await runValidations(validations, {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      role: 'Employee',
    });
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });
});

describe('taskValidation', () => {
  it('rejects a due date earlier than the start date', async () => {
    const validations = taskValidation.slice(0, -1);
    const { req } = await runValidations(validations, {
      title: 'Write report',
      priority: 'High',
      startDate: '2026-07-10',
      dueDate: '2026-07-05',
      assignedEmployeeId: 1,
    });
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  it('accepts a valid task payload', async () => {
    const validations = taskValidation.slice(0, -1);
    const { req } = await runValidations(validations, {
      title: 'Write report',
      priority: 'High',
      startDate: '2026-07-01',
      dueDate: '2026-07-05',
      assignedEmployeeId: 1,
    });
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });
});
