import { Link } from 'react-router-dom';
import { SignInCredentials, signIn } from 'redux-manager';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { scheme } from 'utils';

type InitialValues = SignInCredentials & { error: string };

const SignIn = () => {
  const onSubmit = (values: InitialValues, { setSubmitting, setErrors }: FormikHelpers<InitialValues>) => {
    const { username, password } = values;
    signIn({ username, password })
      .catch((error: string) => setErrors({ error }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="w-screen h-screen flex">
      <Formik //
        initialValues={{ username: '', password: '', error: '' }}
        validationSchema={scheme.object({ username: scheme.username, password: scheme.password })}
        onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form className="max-w-sm w-full m-auto flex flex-col gap-3.5 p-4">
            <h1 className="text-2xl mb-1.5">Sign In</h1>

            <Field //
              name="username"
              placeholder="Username"
              className="border"
              autoComplete="username"
            />
            <ErrorMessage name="username" component="div" className="text-sm" />

            <Field //
              name="password"
              placeholder="Password"
              type="password"
              className="border"
              autoComplete="current-password"
            />
            <ErrorMessage name="password" component="div" className="text-sm" />

            <ErrorMessage name="error" component="div" className="text-sm" />

            <button type="submit" disabled={isSubmitting}>
              Sign In
            </button>

            <div className="text-center">
              <Link to="/sign-up">Sign Up</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignIn;
