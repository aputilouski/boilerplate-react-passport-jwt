import { Link } from 'react-router-dom';
import { SignUpCredentials, signUp } from 'redux-manager';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { scheme } from 'utils';

type InitialValues = SignUpCredentials & { error: string };

const SignUp = () => {
  const onSubmit = (values: InitialValues, { setSubmitting, setErrors }: FormikHelpers<InitialValues>) => {
    const { username, name, password, confirmPassword } = values;
    signUp({ username, name, password, confirmPassword })
      .catch((error: string) => setErrors({ error }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="w-screen h-screen flex">
      <Formik //
        initialValues={{ username: '', name: '', password: '', confirmPassword: '', error: '' }}
        validationSchema={scheme.object({
          name: scheme.name,
          username: scheme.username,
          password: scheme.password,
          confirmPassword: scheme.confirmPassword,
        })}
        onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form className="max-w-sm w-full m-auto flex flex-col gap-3.5 p-4">
            <h1 className="text-2xl mb-1.5">Sign Up</h1>

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
              Sign Up
            </button>

            <div className="text-center">
              <Link to="/">Sign In</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignUp;
