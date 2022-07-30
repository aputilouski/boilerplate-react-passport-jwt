import { Link } from 'react-router-dom';

const Page = () => {
  return (
    <>
      <p>Main page</p>
      <p>
        <Link to="/profile">Profile</Link>
      </p>
    </>
  );
};

export default Page;
