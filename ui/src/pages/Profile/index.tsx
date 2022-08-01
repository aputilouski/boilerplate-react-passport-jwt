import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useStore, updateUser, UserData } from 'redux-manager';
import UpdatePassword from './UpdatePassword';
import { scheme } from 'utils';

const Profile = () => {
  const user = useStore(state => state.auth.user);
  const onSubmit = (values: UserData, { setSubmitting }: FormikHelpers<UserData>) => {
    updateUser(values).finally(() => setSubmitting(false));
  };
  if (!user) return null;
  return (
    <>
      <Formik //
        initialValues={{ username: user.username, name: user.name }}
        validationSchema={scheme.object({ username: scheme.username, name: scheme.name })}
        onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form className="max-w-sm w-full m-auto flex flex-col gap-3.5 p-4">
            <h1 className="text-2xl mb-1.5">Profile</h1>

            <Field //
              name="username"
              placeholder="Username"
              className="border"
              autoComplete="off"
            />
            <ErrorMessage name="username" component="div" className="text-sm" />

            <Field //
              name="name"
              placeholder="Name"
              className="border"
              autoComplete="off"
            />
            <ErrorMessage name="name" component="div" className="text-sm" />

            <button type="submit" disabled={isSubmitting}>
              Save
            </button>
          </Form>
        )}
      </Formik>

      <UpdatePassword />
    </>
  );
};

export default Profile;
