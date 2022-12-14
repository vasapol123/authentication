import React from 'react';
import Lottie from 'lottie-react';

import styles from './loading.module.scss';
import * as loadingWhiteData from '../../assets/loading-white.json';

function Loading(): JSX.Element {
  return (
    <React.Fragment>
      <Lottie className={styles.lottie} animationData={loadingWhiteData} loop />
    </React.Fragment>
  );
}

export default Loading;
