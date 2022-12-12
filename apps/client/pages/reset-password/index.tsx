import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ForgotPassword as FormValues } from '@authentication/types';

import axios from '../../axios.config';
import { signIn } from 'next-auth/react';
import { forgotPasswordSchema } from '../../validation/schema/forgot-password.schema';

function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState<null | string>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await axios.post('/api/auth/email/forgot-password', {
        email: data.email,
      });

      setEmail(data.email);
    } catch (e) {
      setError('email', {
        type: 'custom',
        message: e.response.data.message,
      });
    }
  };

  if (email) {
    return (
      <main>
        <div>Check your email</div>
        <div>
          <p>We sent a password reset link to</p>
          <p>{email}</p>
          <button onClick={() => signIn()}>Sign In</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div>Enter your email to reset password</div>
      <div>
        <p>{errors.email?.message as string}</p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('email', { required: true })}
            placeholder='Email'
          />
          <input type='submit' value='Send link' />
        </form>
      </div>
    </main>
  );
}

export default ForgotPassword;
