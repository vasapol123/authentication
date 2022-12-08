import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from 'next-auth/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Signin as FormValues } from '@authentication/types';

import { loginSchema } from '../../validation/schema/login.schema';
import axios from '../../axios.config';
import { parseCookies } from 'nookies';

function Connection() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: FormValues) => {
    const cookies = parseCookies();
    try {
      const res = await axios.post(
        'api/auth/google/connect',
        {
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            id_token: cookies.GOOGLE_ID_TOKEN,
          },
        },
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main>
      <div>Connection</div>
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

export default Connection;
