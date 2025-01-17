import { CSSTransition } from 'react-transition-group';

import { EXAMPLES_HREF, AnimationTimeout } from 'shared/config';
import { ReactComponent as AppSVG } from 'shared/assets/images/indicators/app.svg';
import { ReactComponent as ExternalResourceSVG } from 'shared/assets/images/actions/externalResource.svg';

import styles from '../Menu.module.scss';

type Props = {
  isFullWidth: boolean;
};

const AppExamplesLink = ({ isFullWidth }: Props) => (
  <a rel="noreferrer" href={EXAMPLES_HREF} target="_blank" className={styles.navLink}>
    <span className={styles.icon}>
      <AppSVG />
    </span>
    <CSSTransition in={isFullWidth} timeout={AnimationTimeout.Tiny}>
      <div className={styles.linkContent}>
        <span className={styles.linkText}>App Examples</span>
        <ExternalResourceSVG />
      </div>
    </CSSTransition>
  </a>
);

export { AppExamplesLink };
