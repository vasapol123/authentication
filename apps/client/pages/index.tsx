import styles from './index.module.scss';
import Navbar from '../components/Navbar';

export function Index() {
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.welcome}>
        <div className={styles.tag}>
          <p>FIRST EDITION</p>
        </div>
        <h1 className={styles.header}>
          #WebApplicationDemo:
          <p>Authentication</p>
        </h1>
      </div>
    </div>
  );
}

export default Index;
