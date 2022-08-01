import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'redux-manager';

const Header = () => {
  const [disabled, setDisabled] = React.useState(false);

  const onClick = React.useCallback(() => {
    setDisabled(true);
    signOut().finally(() => setDisabled(false));
  }, []);

  return (
    <div className="flex justify-between">
      <p>
        <Link to="/profile">Profile</Link>
      </p>

      <button onClick={onClick} disabled={disabled}>
        Sign Out
      </button>
    </div>
  );
};

export default Header;
