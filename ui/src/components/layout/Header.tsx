import { signOut } from 'redux-manager';

const Header = () => {
  return (
    <div className="flex justify-between">
      <p>Header</p>

      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

export default Header;
