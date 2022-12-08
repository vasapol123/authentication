import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Signup as FormValues } from '@authentication/types';

import axios from '../../axios.config';
import { signupSchema } from '../../validation/schema/signup.schema';

function Signup(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await axios.post('api/auth/local/signup', data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main>
      <div>Sign Up</div>

      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor='email'>Email</label>
          <input
            {...register('email', { required: true })}
            placeholder='email'
          />
          <label htmlFor='password'>Password</label>
          <input
            {...register('password', { required: true })}
            type='password'
            placeholder='password'
          />
          <label htmlFor='passwordConfirmation'>Password Confirmation</label>
          <input
            {...register('passwordConfirmation', { required: true })}
            type='password'
            placeholder='password confirmation'
          />
          <label htmlFor='displayName'>Display Name</label>
          <input
            {...register('displayName', { required: true })}
            placeholder='display name'
          />
          <input type='submit' value='Submit' />
        </form>
      </div>
    </main>
  );
}

export default Signup;
