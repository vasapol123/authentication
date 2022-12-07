import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface RefreshTokenHandlerProps {
  setInterval: React.Dispatch<React.SetStateAction<number>>;
}

const RefreshTokenHandler = (props: RefreshTokenHandlerProps) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const timeRemaining = Math.round(
        (session.jwtAccessTokenExpiry - 2 * 60 * 1000 - Date.now()) / 1000,
      );
      console.log(timeRemaining);
      props.setInterval(timeRemaining > 0 ? timeRemaining : 0);
    }
  }, [session, props]);

  return null;
};

export default RefreshTokenHandler;
