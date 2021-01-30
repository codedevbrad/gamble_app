import React, { Fragment , useState , useEffect } from 'react';

import Dropdown from './snippets/dropdown';
import Pusher   from 'pusher-js';

import Register  from './auth/userAuth';
import Header    from './header/header';
import Dashboard from './main/dashboard';

import './app_contain.scss';

import { useStore , useActions } from 'easy-peasy';

const Error = ( props ) => {
    const clearError = useActions( actions => actions.clearError );
    const removeError = ( e ) => {
      clearError();
    }
    return (
      <Fragment>
          <div className="error" onClick={ e => removeError() }>
            <p> { props.msg } </p>
            <p className="error_message">  the app seems to not be working as intended. please refresh your browser. </p>
          </div>
      </Fragment>
    );
}

const MainApp = () => {

     const getUser     = useActions( state => state.getUser );
     const clearErrors = useActions( state => state.clearAllErrors );

     const isUserAuth = useStore( state => state.isUserAuth);
     const user       = useStore( state => state.user );

     const error      = useStore( state => state.error);

     useEffect(() => {
        clearErrors();
        getUser();
        console.log('triggered dashboard' , error );
        // eslint-disable-next-line
     }, []);

    return (
      <Fragment>
          { !Object.keys(error).length === false &&
            <Error msg={ error.err}/>
          }

      <div className="main">
            { !isUserAuth ? (
                <Register />
            ): (
            <Fragment>
                <Header user={ user } />
                <Dashboard />
            </Fragment>
        )}
      </div>
      </Fragment>
    );
}

export default MainApp;
