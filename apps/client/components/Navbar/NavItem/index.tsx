import React, { useState } from 'react';

interface NavItemProps {
  styles: { readonly [key: string]: string };
  children?: React.ReactNode;
  item: JSX.Element;
}

function NavItem(props: NavItemProps) {
  const { styles } = props;
  const [openMenu, setOpenMenu] = useState(false);

  const handleClick = () => {
    if (props.children) {
      setOpenMenu(!openMenu);
    }
  };

  return (
    <li className={styles['nav-item']}>
      <button className={styles['nav-item__button']} onClick={handleClick}>
        {props.item}
      </button>

      {openMenu && props.children}
    </li>
  );
}

export default NavItem;
