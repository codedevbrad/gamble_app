
export const gameFunctions = {

    showGameProgress: ( timeHtml , elem ) => {
          // 60 second game limit & time tick percentage
          var time    = 20;
          var percent = 100;
          var tick    = Math.round(( percent / time ) * 100 ) / 100;

          ( ( ) => {

                timeHtml.innerHTML   = 'game starting';
                elem.style.width = '100%';

                var id = setInterval( frame , 1000 );

                function frame ( ) {

                          time = time - 1;
                          percent = percent - tick;

                    if (percent < 1 ) {
                          clearInterval(id);
                          // grab remaining width and remove remaining width.
                          timeHtml.innerHTML = 'round ended';
                          elem.style.width   = 0 + '%';
                    }
                    else {
                          elem.style.width   = percent + '%';
                          timeHtml.innerHTML =  time + ' secs left';
                    }
                }
      })();
    }
}
