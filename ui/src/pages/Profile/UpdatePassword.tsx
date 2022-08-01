import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { UpdatePasswordArgs, updatePassword } from 'redux-manager';
import { scheme } from 'utils';

type InitialValues = UpdatePasswordArgs & { error: string };

const UpdatePassword = () => {
  const onSubmit = (values: InitialValues, { setSubmitting, setErrors, resetForm }: FormikHelpers<InitialValues>) => {
    const { currentPassword, password, confirmPassword } = values;
    updatePassword({ currentPassword, password, confirmPassword })
      .then(() => resetForm())
      .catch((error: string) => setErrors({ error }))
      .finally(() => setSubmitting(false));
  };

  return (
    <Formik //
      initialValues={{ currentPassword: '', password: '', confirmPassword: '', error: '' }}
      validationSchema={scheme.object({
        currentPassword: scheme.password,
        password: scheme.password,
        confirmPassword: scheme.confirmPassword,
      })}
      onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="max-w-sm w-full m-auto flex flex-col gap-3.5 p-4">
          <h1 className="text-2xl mb-1.5">Update Password</h1>

          <Field //
            name="currentPassword"
            placeholder="Current Password"
            type="password"
            className="border"
            autoComplete="off"
          />
          <ErrorMessage name="currentPassword" component="div" className="text-sm" />

          <Field //
            name="password"
            placeholder="Password"
            type="password"
            className="border"
            autoComplete="off"
          />
          <ErrorMessage name="password" component="div" className="text-sm" />

          <Field //
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            className="border"
            autoComplete="off"
          />
          <ErrorMessage name="confirmPassword" component="div" className="text-sm" />

          <ErrorMessage name="error" component="div" className="text-sm" />

          <button type="submit" disabled={isSubmitting}>
            Update Password
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default UpdatePassword;
