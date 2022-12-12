import React from 'react';

interface ProfileIconProps {
  styles: { readonly [key: string]: string };
  children: React.ReactNode;
}

function ProfileIcon(props: ProfileIconProps) {
  const { styles } = props;

  return (
    <div className={styles.profile}>
      <span className={styles.profile__letter}>{props.children}</span>
    </div>
  );
}

export default ProfileIcon;
