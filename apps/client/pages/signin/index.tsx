import React from 'react';
import styles from './login.module.scss';
import { signIn } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Signin as FormValues } from '@authentication/types';

import { loginSchema } from '../../validation/schema/login.schema';
import useAuth from '../../hooks/useAuth';

function Signin(): JSX.Element {
  const isAuth = useAuth(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await signIn('credentials', {
        ...data,
        callbackUrl: `${window.location.origin}`,
        redirect: false,
      });
      console.log(res.error);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main>
      <div>Login</div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor='email'>Email</label>
          <input
            {...register('email', { required: true })}
            placeholder='email'
          />
          <p>{errors.email?.message as string}</p>
          <label htmlFor='password'>Password</label>
          <input
            {...register('password', { required: true })}
            type='password'
            placeholder='password'
          />
          <p>{errors.password?.message as string}</p>
          <input type='submit' value='Submit' />
        </form>
      </div>
    </main>
  );
}

export default Signin;
