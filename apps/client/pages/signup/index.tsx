import React from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Signup as FormValues } from '@authentication/types';

import styles from './signup.module.scss';
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
      const res = await axios.post('api/auth/email/signup', data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.title}>Sign Up</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('email', { required: true })}
          placeholder='Email'
          className={styles.form__email}
        />
        <input
          {...register('password', { required: true })}
          type='password'
          placeholder='Password'
          className={styles.form__password}
        />
        <input
          {...register('passwordConfirmation', { required: true })}
          type='password'
          placeholder='Password Confirmation'
          className={styles.form__passwordConfirmation}
        />
        <input
          {...register('displayName', { required: true })}
          placeholder='Display Name'
          className={styles.form__displayName}
        />
        <input type='submit' value='Submit' className={styles.form__submit} />
      </form>
      <div className={styles.link}>
        Already have an account?
        <span onClick={() => signIn()} className={styles.link__signin}>
          Sign in
        </span>
      </div>
    </main>
  );
}

export default Signup;
