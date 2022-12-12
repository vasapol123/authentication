import React from 'react';
import { Session } from 'next-auth';
import ProfileIcon from '../Icon';

import styles from './dropdown-menu.module.scss';

interface ProfileDropdownMenuProps {
  onLogoutClick: () => Promise<void>;
  session: Session;
  openMenu?: boolean;
  setOpenMenu?: React.Dispatch<React.SetStateAction<boolean>>;
}

function ProfileDropdownMenu(props: ProfileDropdownMenuProps) {
  const { session } = props;

  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdown__display}>
        <ProfileIcon styles={styles}>K</ProfileIcon>
        <div className={styles.user}>
          <p>{session.user.displayName}</p>
          <p>{session.user.email}</p>
        </div>
      </div>
      <div className={styles.dropdown__menu}>
        <input
          type='button'
          value='Logout'
          onClick={props.onLogoutClick}
          className={styles.logout}
        />
      </div>
    </div>
  );
}

export default ProfileDropdownMenu;
