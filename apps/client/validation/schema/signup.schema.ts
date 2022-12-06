import * as yup from 'yup';

export const signupSchema = yup.object().shape({
  email: yup.string().email().required(),
  displayName: yup.string().min(4).required(),
  password: yup.string().min(6).max(20).required(),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Password must match'),
});
