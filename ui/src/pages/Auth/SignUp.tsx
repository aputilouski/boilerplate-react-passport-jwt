import { Link } from 'react-router-dom';
import { SignUpCredentials, signUp } from 'redux-manager';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';

type InitialValues = SignUpCredentials & { error: string };

const SignUp = () => {
  const onSubmit = (values: InitialValues, { setSubmitting, setErrors }: FormikHelpers<InitialValues>) => {
    const { username, name, password, confirmPassword } = values;
    console.log(values);
    signUp({ username, name, password, confirmPassword })
      .catch((error: string) => setErrors({ error }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="w-screen h-screen flex">
      <Formik //
        initialValues={{ username: '', name: '', password: '', confirmPassword: '', error: '' }}
        validationSchema={Yup.object({
          name: Yup.string().min(4, 'Must be 4 characters or more').max(40, 'Must be 40 characters or less').required('Required'),
          username: Yup.string().min(4, 'Must be 4 characters or more').max(20, 'Must be 20 characters or less').required('Required'),
          password: Yup.string().min(8, 'Must be 8 characters or more').max(20, 'Must be 20 characters or less').required('Required'),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Required'),
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
