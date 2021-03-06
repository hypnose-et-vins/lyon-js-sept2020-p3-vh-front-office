import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Link, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import './Login.scss';
import { useToasts } from 'react-toast-notifications';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import API from '../../services/API';

const useStyles = makeStyles((theme) => ({
  btn: {
    marginBottom: '50px',
    color: 'white',
    backgroundColor: '#6d071a',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#6d071a',
    },
  },
  input: {
    [theme.breakpoints.up('md')]: {
      width: '400px',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#6d071a',
    },
    '& .MuiOutlinedInput-input': {
      color: '#6d071a',
    },
    '& .MuiInputLabel-outlined.Mui-focused': {
      color: '#6d071a',
    },
  },
}));

function Login() {
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const { register, handleSubmit, errors } = useForm({
    mode: 'onBlur',
  });
  const history = useHistory();
  const onSubmit = async (data) => {
    try {
      await API.post('auth/login', data);
      history.push('/profile');
      addToast('Vous êtes désormais connecté', {
        appearance: 'success',
        autoDismiss: true,
      });
    } catch (err) {
      addToast('Identifiants non reconnus', {
        appearance: 'error',
        autoDismiss: true,
      });
    }
  };

  useEffect(() => {
    if (errors) {
      const arrayErrors = Object.values(errors);
      arrayErrors.map((error) =>
        addToast(error.message, {
          appearance: 'error',
          autoDismiss: true,
        })
      );
    }
  }, [errors]);

  return (
    <>
      <div className="container-login">
        <Helmet>
          <title>Login</title>
        </Helmet>
        <div>
          <h1 className="login">{t('Connection.h1')}</h1>
          <p className="line">________________________</p>
        </div>
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <TextField
              className={useStyles().input}
              name="email"
              inputRef={register({
                required: 'Veuillez renseigner votre email',
              })}
              id="outlined-basic"
              label="Email"
              variant="outlined"
            />
          </div>
          <div className="password">
            <TextField
              className={useStyles().input}
              name="password"
              inputRef={register({
                required: 'Veuillez renseigner votre mot de passe',
                minLength: {
                  value: 8,
                  message:
                    'Votre mot de passe doit contenir au moins 8 caractères.',
                },
              })}
              id="outlined-basic"
              label={t('Connection.label2')}
              variant="outlined"
              type="password"
            />
          </div>
          <FormControlLabel
            control={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <Checkbox
                name="stayConnected"
                color="primary"
                inputRef={register}
              />
            }
            label={t('Connection.checkbox')}
          />
          <div className="register-password">
            <Link to="/forgot-password">
              <p style={{ color: 'black' }}>{t('Connection.link1')}</p>
            </Link>
            <Link to="/register">
              <p style={{ color: 'black' }}>{t('Connection.link2')}</p>
            </Link>
          </div>

          <div className="submit-login">
            <Button
              variant="contained"
              color="default"
              type="submit"
              onClick={handleSubmit}
              className={useStyles().btn}
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;
