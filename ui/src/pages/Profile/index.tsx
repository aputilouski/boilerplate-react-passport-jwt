import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { useStore, updateUser, UserData } from 'redux-manager';
import * as Yup from 'yup';

const Profile = () => {
  const user = useStore(state => state.auth.user);
  const onSubmit = (values: UserData, { setSubmitting }: FormikHelpers<UserData>) => {
    updateUser(values).finally(() => setSubmitting(false));
  };
  if (!user) return null;
  return (
    <Formik //
      initialValues={{ username: user.username, name: user.name }}
      validationSchema={Yup.object({
        username: Yup.string().min(4, 'Must be 4 characters or more').max(20, 'Must be 20 characters or less').required('Required'),
        name: Yup.string().min(4, 'Must be 4 characters or more').max(40, 'Must be 40 characters or less').required('Required'),
      })}
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
            placeholder="name"
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
  );
};

export default Profile;
