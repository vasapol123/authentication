import React from 'react';
import styles from './login.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Signin as FormValues } from '@authentication/types';

import axios from '../../axios.config';
import { loginSchema } from '../../validation/schema/login';

function Login(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(loginSchema),
  });
  const onSubmit = async (data: FormValues) => {
    try {
      const res = await axios.post('api/auth/local/signin', data);
      console.log(res);
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

export default Login;
