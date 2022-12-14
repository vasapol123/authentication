import * as yup from 'yup';

export const signinSchema = yup.object().shape({
  email: yup
    .string()
    .required('Please provide your email.')
    .email('Please provide a valid email.'),
  password: yup
    .string()
    .required('Please provide your password.')
    .matches(/[a-zA-Z0-9]/, 'Password can only contain Latin letters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
      'Password must contain 8 letters, one uppercase, one lowercase and one number.',
    )
    .min(8, 'Please provide a 8-letter password.')
    .max(20, 'Password must not be longer than 20 letters.'),
});
