module.exports.randomImg = function() {
  var imgs = [
     { url: 'https://images.unsplash.com/photo-1561126135-b7a5dfadace6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1900&q=80'    },
     { url: 'https://images.unsplash.com/photo-1466916932233-c1b9c82e71c4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80' },
     { url: 'https://images.unsplash.com/photo-1472978346569-9fa7ea7adf4a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80' },
     { url: 'https://images.unsplash.com/photo-1503888162233-e16bea2cef78?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80' }
  ];
  const randomImg = imgs[ Math.floor( Math.random() * imgs.length )];

  return randomImg.url;
}

// move these over to mongocloud with image uploading.
