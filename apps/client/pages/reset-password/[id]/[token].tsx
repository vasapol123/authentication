import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import {
  ResetPassword as FormValues,
  sendMailPayload,
} from '@authentication/types';

import axios from '../../../axios.config';

interface ResetPasswordProps {
  id?: string;
  token?: string;
  payload?: sendMailPayload;
  isValid: boolean;
}

function ResetPassword(props: ResetPasswordProps): JSX.Element {
  const [isReset, setIsReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      await axios.post(
        `/api/auth/email/reset-password/${props.id}/${props.token}`,
        {
          newPassword: data.newPassword,
        },
      );

      setIsReset(true);
    } catch (e) {
      console.log(e);
    }
  };

  if (!props.isValid) {
    return (
      <main>
        <div>The password reset link isn&#39;t valid</div>
        <div>
          <p>
            The link is corrupted because you probably have already reset your
            password, or the token is invalid due to expiry.
          </p>
          <button onClick={() => signIn()}>Continue</button>
        </div>
      </main>
    );
  }

  if (isReset) {
    return (
      <main>
        <div>Password reset</div>
        <div>
          <p>
            Your password has been successfully reset. Click below to back to
            sign in.
          </p>
          <button onClick={() => signIn()}>Continue</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div>Set new password</div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('newPassword', { required: true })}
            placeholder='Password'
            type='password'
          />
          <input
            {...register('passwordConfirmation', { required: true })}
            placeholder='Password Confirmation'
          />
          <input type='submit' value='Submit' />
        </form>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;

  try {
    const res = await axios.get(
      `/api/auth/email/reset-password/${params.id}/${params.token}`,
    );

    return {
      props: {
        id: params.id,
        token: params.token,
        payload: res.data,
        isValid: true,
      },
    };
  } catch (e) {
    return {
      props: {
        isValid: false,
      },
    };
  }
};

export default ResetPassword;
