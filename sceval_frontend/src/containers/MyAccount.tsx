import React, { Fragment, useState, useEffect } from 'react';
import LeftNav from '../components/LeftNav';
import { AppContext } from '../controllers/AppContext';
import { Redirect, withRouter, RouteComponentProps } from 'react-router';
// required images imported
const email = require('../common_images/acct_email.svg');
const name = require('../common_images/acct_name.svg');
const password = require('../common_images/acct_password.svg');

interface HardwareProps extends React.Props<any> {
  isLoggedIn: boolean;
  onLogIn: () => void;
}

const MyAccount = withRouter(
  (props: HardwareProps & RouteComponentProps<any>) => {
    const [isEditing, setisEditing] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [passwordNew, setPasswordNew] = useState<string>('');
    const [passwordConfirm, setPasswordConfirm] = useState<string>('');
    const [formValid, setFormValid] = useState<boolean>(false);
    // get user information on component mount
    useEffect(() => {
      const user = JSON.parse(`${localStorage.getItem('user-login')}`).value
        .user;
      setUsername(user.name);
    },        [isEditing]);
    // logout method on click of "Logout button"
    const logout = async () => {
      try {
        // need to wait until log out is done before redirecting the user or
        // else the API call might be canceled.
        await AppContext.logout(true);
      } catch (error) {
        console.log(error);
      }
      setTimeout(() => {
        location.pathname = '/login';
      },         1000);
    };
    // toggle editing vs. non-editing mode handler
    const editUserInfo = (): void => {
      setisEditing(!isEditing);
    };
    // updating changes made to user information on submit handler
    const saveChanges = async (event: React.FormEvent) => {
      event.preventDefault();
      AppContext.restoreLogin();
      if (passwordNew === '') {
        const status: number = await AppContext.changeUserName(username);
        if (status === 204) {
          setisEditing(false);
        }
      } else {
        const status: number = await AppContext.UpdateUserInfo(username, passwordNew);
        if (status === 204) {
          setisEditing(false);
        }
      }
    };
    // handler for text change for name or password
    const handleInputChange = (event: React.FormEvent<HTMLElement>): void => {
      const target = event.target as HTMLInputElement;
      const input = target.value;
      switch (target.name) {
        case 'name':
          setUsername(input);
          break;
        case 'passwordNew':
          setPasswordNew(input);
          break;
        case 'passwordConfirm':
          setPasswordConfirm(input);
          break;
        default:
          break;
      }
      // if the username is new and not blank:
      if (target.name === 'name' && target.value !== '' && target.value !== 
        JSON.parse(`${localStorage.getItem('user-login')}`).value.user.name) {
        setFormValid(true);
      } else { // otherewise set form to false
        setFormValid(false);
      }
      if ((target.name === 'passwordNew' || target.name ===  'passwordConfirm') &&
          passwordConfirm === passwordNew &&
        passwordConfirm !== '' && passwordNew !== '') {
          setFormValid(true);
        }  else if (target.value === '' || target.value === 
        JSON.parse(`${localStorage.getItem('user-login')}`).value.user.name)  {
          setFormValid(false);
        }
    };
    // if the user isn't logged in, redirect them to login
    if (!props.isLoggedIn) {
      return <Redirect to="/login" />;
    }

    const userData = JSON.parse(`${localStorage.getItem('user-login')}`);

    return (
      <div>
        <LeftNav />
        <div className="account-section">
          <div className="page-header">
            <h1>My Account</h1>
          </div>
          <div className="info-container">
            <div
              className={
                !isEditing ? 'user-info-section' : 'user-info-section edit-mode'
              }
            >
              <h3>
                User Info
                {!isEditing ? (
                  <button className="action-button" onClick={editUserInfo}>
                    Edit
                  </button>
                ) : (
                  <Fragment>
                    <button onClick={editUserInfo} className="action-button">
                      Cancel
                    </button>
                    <button
                      onClick={event => saveChanges(event)}
                      disabled={!formValid}
                      className="action-button update-account"
                    >
                      Save Changes
                    </button>
                  </Fragment>
                )}
              </h3>
              <img src={name} />
              <h4>Name:</h4>
              {!isEditing ? (
                <div className="user-data">{username}</div>
              ) : (
                <input
                  type="text"
                  className="user-data edit-box"
                  value={username}
                  name="name"
                  onChange={event => handleInputChange(event)}
                  onBlur={event => handleInputChange(event)}
                />
              )}
              <img className="mail" src={email} />
              <h4> Email:</h4>
              <div className="user-data">{userData.value.user.email}</div>
              <img src={password} />
              <h4>Password:</h4>
              {!isEditing ? (
                <div className="user-data">•••••••••</div>
              ) : (
                <Fragment>
                  <input
                    type="password"
                    className="user-data edit-box"
                    value={passwordNew}
                    name="passwordNew"
                    onChange={event => handleInputChange(event)}
                    onBlur={event => handleInputChange(event)}
                  />
                  <input
                    type="password"
                    className="user-data edit-box"
                    value={passwordConfirm}
                    name="passwordConfirm"
                    onChange={event => handleInputChange(event)}
                    onBlur={event => handleInputChange(event)}
                  />
                </Fragment>
              )}
            </div>
            <div className="sign-out-section">
              <h3>Sign Out</h3>
              <button className="sign-out-button" onClick={logout}>
                Sign Out
              </button>
            </div>
          </div>
          <div className="footer">
            <a href="https://www.tinkermode.com/legal/tos.html" target="_blank">
              Terms of Service
            </a>
            <div>•</div>
            <a
              href="https://www.tinkermode.com/legal/privacy.html"
              target="_blank"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    );
  }
);

export default MyAccount;
