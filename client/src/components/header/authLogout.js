import React, { useState } from 'react';

import { useStore , useActions } from 'easy-peasy';

const UserLogout = () => {
    const logout = useActions( actions => actions.logoutUser);
    return (
      <li className="logout" onClick={ logout }>
          Logout
      </li>
    );
}

export default UserLogout;
