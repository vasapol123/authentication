import React from 'react';
import styles from './signin.module.scss';
import { signIn } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Signin as FormValues } from '@authentication/types';
import Image from 'next/image';

import GoogleIcon from '../../assets/google_icon_ios.svg';
import { loginSchema } from '../../validation/schema/login.schema';
import useAuth from '../../hooks/useAuth';
import axios from '../../axios.config';
import { useRouter } from 'next/router';

function Signin(): JSX.Element {
  // const isAuth = useAuth(true);
  const router = useRouter();

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

  const onGoogleButtonClick = async () => {
    try {
      const res = await signIn('google');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.title}>Sign In</div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          {...register('email', { required: true })}
          placeholder='Email'
          className={styles.form__email}
        />
        <p>{errors.email?.message as string}</p>
        <input
          {...register('password', { required: true })}
          type='password'
          placeholder='Password'
          className={styles.form__password}
        />
        <p>{errors.password?.message as string}</p>
        <input type='submit' value='Submit' className={styles.form__submit} />
      </form>

      <div className={styles.or}>
        <span className={styles.or__text}>or</span>
      </div>

      <div className={styles.google}>
        <button onClick={onGoogleButtonClick} className={styles.google__button}>
          <Image
            src={GoogleIcon}
            alt='Google Login Button'
            className={styles.google__icon}
          />
          <span>Continue with Google</span>
        </button>
      </div>
      <div className={styles.link}>
        <span
          onClick={() => router.push('/reset-password')}
          className={styles.link__color}
        >
          Forgot password?
        </span>
      </div>
      <div className={styles.link}>
        No account?
        <span onClick={() => signIn()} className={styles.link__color}>
          Create account
        </span>
      </div>
    </main>
  );
}

export default Signin;
