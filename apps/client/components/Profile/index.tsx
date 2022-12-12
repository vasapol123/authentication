import React from 'react';

import ProfileIcon from './Icon';
import styles from './profile.module.scss';

function Profile(): JSX.Element {
  return (
    <React.Fragment>
      <ProfileIcon styles={styles}>K</ProfileIcon>
    </React.Fragment>
  );
}

export default Profile;
