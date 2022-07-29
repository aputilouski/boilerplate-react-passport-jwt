import React from 'react';
import { Link } from 'react-router-dom';
import { SignInCredentials, signIn } from 'redux-manager';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';

type InitialValues = SignInCredentials & { error: string };

const SignIn = () => {
  const onSubmit = React.useCallback((values: InitialValues, { setSubmitting, setErrors }: FormikHelpers<InitialValues>) => {
    const { username, password } = values;
    signIn({ username, password })
      .catch((error: string) => setErrors({ error }))
      .finally(() => setSubmitting(false));
  }, []);

  return (
    <div className="w-screen h-screen flex">
      <Formik //
        initialValues={{ username: '', password: '', error: '' }}
        validationSchema={Yup.object({
          username: Yup.string().min(4, 'Must be 4 characters or more').max(20, 'Must be 20 characters or less').required('Required'),
          password: Yup.string().min(8, 'Must be 8 characters or more').max(20, 'Must be 20 characters or less').required('Required'),
        })}
        onSubmit={onSubmit}>
        {({ isSubmitting }) => (
          <Form className="max-w-sm w-full m-auto flex flex-col gap-3.5 p-4">
            <h1 className="text-2xl mb-1.5">Login</h1>

            <Field name="username" className="border" autoComplete="username" />
            <ErrorMessage name="username" component="div" className="text-sm" />

            <Field name="password" type="password" className="border" autoComplete="current-password" />
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
