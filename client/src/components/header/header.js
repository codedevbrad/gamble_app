import React, { Fragment , useState , useEffect } from 'react';
import Dropdown from '../snippets/dropdown';
import UserLogout from './authLogout';
import { useStore , useActions } from 'easy-peasy';

const Header = ( props ) => {
  const user = props.user;

  const dropdownNavLink = ( props ) => { return (
     <Fragment>
         <h1 className ="head_user_name"> { user.username } </h1>
         <div className="head_user_profile">
             <div className="hero_img_circle">
               <img className="hero_img" src={ user.imgUrl } />
             </div>
         </div>
     </Fragment>
  )}

  const dropdownNavUl = ( props ) => {
    return (
        <Fragment>
          <div className="dropdown-content">
              <ul>
                <UserLogout />
              </ul>
          </div>
        </Fragment>
     )
  }
  const bitsDropNavLink = ( props ) => { return ( <h1 className="head_user_bits"> { user.points + " bits" } </h1> ) }
  const bitsDropNavUl   = ( props ) => {
    return (
      <Fragment>
        <div className="dropdown-content">
            <ul>
              <li> 100 bits  </li>
              <li> 200 bits  </li>
              <li> 500 bits  </li>
            </ul>
        </div>
      </Fragment>
    )
  }
  return (
     <div className="header_wrap">
        <header className="header">
          <div id="header-title">
            <h1> gamblemee </h1>
          </div>

          <div id="header-nav">
             <ul> </ul>
          </div>

          <div id="header-social">
            <Dropdown link={ bitsDropNavLink() } element={ bitsDropNavUl()  } />
            <Dropdown link={ dropdownNavLink() } element={ dropdownNavUl()  } />
          </div>

        </header>
      </div>
  )
}

export default Header;
