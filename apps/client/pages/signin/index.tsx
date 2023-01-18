import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { signIn, SignInResponse } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Signin as FormValues } from '@authentication/types';
import classNames from 'classnames';
import _ from 'lodash';

import styles from './signin.module.scss';
import GoogleIcon from '../../assets/google_icon_ios.svg';
import { signinSchema } from '../../validation/schema/signin.schema';
import Loading from '../../components/Loading';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';

function Signin(): JSX.Element {
  useAuth(true);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [signInResponse, setSignInResponse] = useState<null | SignInResponse>(
    null,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues & { error: string }>({
    resolver: yupResolver(signinSchema),
  });

  useEffect(() => {
    watch(() => {
      if (signInResponse) {
        setSignInResponse(null);
      }
    });
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      const res = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      setIsLoading(false);
      setSignInResponse(res);

      router.push('/');
    } catch (e) {
      setIsLoading(false);
    }
  };

  const onGoogleButtonClick = async () => {
    try {
      const res = await signIn('google');
    } catch (e) {
      console.log(e);
    }
  };

  const handleFetchDataError: (type: string | null) => JSX.Element = (type) => {
    if (type === 'password') {
      return (
        <p>
          Your password is incorrect. If you can&#39;t remember your password,{' '}
          <Link href='/reset-password' className={styles.error__link}>
            reset it now.
          </Link>
        </p>
      );
    } else if (type === 'user') {
      return (
        <p>
          This account does not exist. Enter a different account or{' '}
          <Link href='/signup' className={styles.error__link}>
            create a new one.
          </Link>
        </p>
      );
    }

    return <p>Unknown error</p>;
  };

  return (
    <main className={styles.container}>
      <div className={styles.title}>Sign In</div>
      <div className={styles.error}>
        {signInResponse &&
          signInResponse.error &&
          !signInResponse.ok &&
          handleFetchDataError(signInResponse.error)}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          {...register('email', { required: true })}
          placeholder='Email'
          className={classNames(styles.form__email, {
            [styles['form__email-error']]: !!errors.email,
          })}
        />
        <p
          className={classNames(styles['form__email-error-message'], {
            [styles.hidden]: !errors.email,
          })}
        >
          {errors.email && _.capitalize(errors.email?.message)}
        </p>
        <input
          {...register('password', { required: true })}
          type='password'
          placeholder='Password'
          className={classNames(styles.form__password, {
            [styles['form__password-error']]: !!errors.password,
          })}
        />
        <p
          className={classNames(styles['form__password-error-message'], {
            [styles.hidden]: !errors.password,
          })}
        >
          {errors.password && _.capitalize(errors.password?.message)}
        </p>
        <button type='submit' className={styles.form__submit}>
          {isLoading ? <Loading /> : <div>Sign in</div>}
        </button>
      </form>

      <div className={styles.or}>
        <span className={styles.or__text}>or</span>
      </div>

      <div className={styles.google} onClick={onGoogleButtonClick}>
        <button className={styles.google__button}>
          <Image
            src={GoogleIcon}
            alt='Google Login Button'
            className={styles.google__icon}
          />
          <span>Continue with Google</span>
        </button>
      </div>
      <div className={styles.link}>
        <Link href='/reset-password' className={styles.link__color}>
          Forgot password?
        </Link>
      </div>
      <div className={styles.link}>
        No account?
        <Link href='/signup' className={styles.link__color}>
          Create account
        </Link>
      </div>
    </main>
  );
}

export default Signin;
