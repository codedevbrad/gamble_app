import React, { Fragment , useState , useEffect } from 'react';
import './auth.scss';
import { useStore , useActions } from 'easy-peasy';
import axios from 'axios';

import { GoogleLogin } from 'react-google-login';

const AuthError = () => {
    const error = useStore( state => state.authError);
    return (
      <Fragment>
        { !Object.keys(error).length === false &&
            <p className="auth_error_msg"> { error.msg } </p>
        }
      </Fragment>
    )
}

const LoginUser = ( props ) => {

      const [ username , setUsername ] = useState('');
      const [ password , setPassword ] = useState('');
      const loginUser    = useActions( actions => actions.loginUser );
      const authenticate = useActions( actions => actions.authenticate );

      const googleId = process.env.REACT_APP_GOOGLECLIENTID;

      const responseGoogle = ( res ) => {
           const resUser = res.profileObj;
           const user    = JSON.stringify( { username: resUser.name , password: resUser.googleId , imgUrl: resUser.imageUrl } );
           const config  = { headers: { 'Content-Type': 'application/json' } };

           axios.post('/user/google' , user , config )
              .then( res  => { return res.data })
              .then( user => {
                 console.log( 'user recieved' , user );
                 authenticate( user );
              })
              .catch( err => console.log(err.response.data) );
      }

      return (
        <Fragment>
        <h2 className="auth_form_title"> Login </h2>
        <AuthError />
        <form className="auth_form" onSubmit={ e => {
           e.preventDefault();
           loginUser( { username , password } );
         }}>
           <input type="text"     placeholder="username" name="username" onChange={ e => setUsername( e.target.value )} />
           <input type="password" placeholder="password" name="password" onChange={ e => setPassword( e.target.value )}/>
           <button type="submit"  className="submit_form"> login </button>
        </form>

        <div className="google_auth_contain">

            <GoogleLogin className="google0auth_button"
              clientId = { googleId }   
              buttonText="login with google"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              cookiePolicy={'single_host_origin'}
            />

        </div>
        </Fragment>
      )
}

const RegisterUser = ( props ) => {

      const [ username , setUsername ] = useState('');
      const [ password , setPassword ] = useState('');
      const registerUser = useActions( actions => actions.registerUser);
      return (
          <Fragment>
          <h2 className="auth_form_title"> register for an account </h2>
          <AuthError />
          <form className="auth_form" onSubmit={ e => {
             e.preventDefault();
             registerUser( { username , password })
             }}>
             <input type="text"     placeholder="username" name="username" onChange={ e => setUsername( e.target.value )} />
             <input type="password" placeholder="password" name="password" onChange={ e => setPassword( e.target.value )}/>
             <button type="submit"  className="submit_form"> register </button>
          </form>
          </Fragment>
      )
}

const UserForm = () => {
    const [ name  , setName  ] = useState('Register');
    const [ state , setState ] = useState(false);

    const clearErrors = useActions( state => state.clearAllErrors );

    const handleClick = ( ) => {
      state ? setState(false)  : setState(true);
      state ? setName('register') : setName('Login');
      clearErrors();
    }
    useEffect(() => {
      console.log('did update');
      // eslint-disable-next-line
    }, []);

    return (
      <div className="authUser_container">
        <section className="authUser_Form">
            { !state ? (
               <LoginUser  />
              ) : (
               <RegisterUser />
              )
            }
            <section className="authUser_handle_state">
            <p onClick={ handleClick } className="toggle_auth_state"> { name } </p>
            <p> Reset Password </p>
            </section>
        </section>
      </div>
    );
}

export default UserForm;
