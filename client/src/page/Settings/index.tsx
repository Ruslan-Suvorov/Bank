import "./index.scss";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../component/Header";
import InputField from "../../component/InputField";
import Button from "../../component/Button";
import Divider from "../../component/Divider";
import Notification from "../../component/Notification";
import Title from "../../component/Title";

const SettingsPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [oldPasswordEmail, setOldPasswordEmail] = useState("");
  const [oldPasswordPassword, setOldPasswordPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState(authContext?.state.user?.email || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!authContext) {
    return <div>Ошибка контекста</div>;
  }

  const { state, dispatch } = authContext;

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ email, password: oldPasswordEmail }),
      });

      if (response.ok) {
        // const data = await response.json();
        dispatch({ type: "UPDATE_USER", payload: { email } });
        setSuccess("Email updated successfully");
        setEmail("");
        setOldPasswordEmail("");
      } else {
        const data = await response.json();
        setError(data.message || "Update error");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Update error");
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ oldPassword: oldPasswordPassword, newPassword }),
      });

      if (response.ok) {
        setSuccess("Password updated successfully");
        setOldPasswordPassword("");
        setNewPassword("");
      } else {
        const data = await response.json();
        setError(data.message || "Update error");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Update error");
      } else {
        setError("Something went wrong");
      }
    }
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return (
    <div className="settings">
      <Header title="Settings" />
      <form className="settings__form" onSubmit={handleEmailChange}>
        <Title>Change email</Title>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          label="Password"
          type="password"
          value={oldPasswordEmail}
          onChange={(e) => setOldPasswordEmail(e.target.value)}
          required
        />
        <Button label="Save Email" type="submit" small />
      </form>
      <Divider />
      <form className="settings__form" onSubmit={handlePasswordChange}>
        <Title>Change password</Title>
        <InputField
          label="Old Password"
          type="password"
          value={oldPasswordPassword}
          onChange={(e) => setOldPasswordPassword(e.target.value)}
          required
        />
        <InputField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Button label="Save Password" type="submit" small />
      </form>
      <Divider />
      <Button label="Log out" onClick={handleLogout} small warning />
      <Notification message={error || undefined} type="error" />
      <Notification message={success || undefined} type="success" />
    </div>
  );
};

export default SettingsPage;
