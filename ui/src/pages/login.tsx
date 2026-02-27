import { Alert, Button, Form, Input } from "antd";
import {
  type AuthError,
  AuthErrorCodes,
  signInWithEmailAndPassword,
} from "firebase/auth";
import auth from "../lib/firebase/auth";
import { useState } from "react";

const isAuthError = (error: unknown): error is AuthError =>
  typeof error === "object" && error !== null && "code" in error;

const defaultLoginErrorMessage =
  "An error occurred during login. Please try again.";
const authErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case AuthErrorCodes.INVALID_EMAIL:
      return "That doesn't look like a valid email address.";
    case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
    case AuthErrorCodes.USER_DELETED: // auth/user-not-found
    case AuthErrorCodes.INVALID_PASSWORD: // auth/wrong-password
      return "Incorrect email or password.";
    case AuthErrorCodes.USER_DISABLED:
      return "This account has been disabled. Please contact support.";
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return "Too many failed attempts. Please try again later.";
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return "Network error. Please check your connection and try again.";
    default:
      return defaultLoginErrorMessage;
  }
};

type FieldType = {
  username: string;
  password: string;
};

const LoginPage = () => {
  const [loginError, setLoginError] = useState<string | null>(null);

  const onFinish = async (values: FieldType) => {
    try {
      await signInWithEmailAndPassword(auth, values.username, values.password);
      window.location.href = "/";
    } catch (error) {
      if (isAuthError(error)) {
        setLoginError(authErrorMessage(error));
      } else {
        setLoginError(defaultLoginErrorMessage);
      }
    }
  };

  return (
    <Form name="login" autoComplete="off" onFinish={onFinish}>
      {loginError && (
        <Alert
          type="error"
          title={loginError}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Form.Item label="Username" name="username">
        <Input />
      </Form.Item>
      <Form.Item label="Password" name="password">
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginPage;
