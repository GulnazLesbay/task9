const express = require( 'express' );
const fs = require( 'fs' );
const path = require( 'path' );
const React = require( 'react' );
const ReactDOMServer = require( 'react-dom/server' );
const { StaticRouter, matchPath } = require( 'react-router-dom' );

                                                                                                                                      // создаем экспресс-приложение
const app = express();

const { App } = require( '../src/components/app' );

const routes = require( './routes' );

                                                                                                                                      // обслуживаем статические ресурсы
app.get( /\.(js|css|map|ico)$/, express.static( path.resolve( __dirname, '../dist' ) ) );

                                                                                                                                      //Барлық басқа запростарды обрабатывать етеди
app.use( '*', async ( req, res ) => {

                                                                                                                                        // urlге сайкес келетин маршрутты табады
    const matchRoute = routes.find( route => matchPath( req.originalUrl, route ) );

                                                                                                                                      // сәйкес компоненттің деректерін шығарады
    let componentData = null;
    if( typeof matchRoute.component.fetchData === 'function' ) {
        componentData = await matchRoute.component.fetchData();
    }

                                                                                                                                         // читаем файл `index.html`
    let indexHTML = fs.readFileSync( path.resolve( __dirname, '../dist/index.html' ), {
        encoding: 'utf8',
    } );
    let appHTML = ReactDOMServer.renderToString(
        <StaticRouter location={ req.originalUrl } context={ componentData }>
            <App />
        </StaticRouter>
    );

                                                                                                                                        // `#app` элементін `appHTML` арқылы толтырыңыз
    indexHTML = indexHTML.replace( '<div id="app"></div>', `<div id="app">${ appHTML }</div>` );

    indexHTML = indexHTML.replace(
        'var initial_state = null;',
        `var initial_state = ${ JSON.stringify( componentData ) };`
    );

    res.contentType( 'text/html' );
    res.status( 200 );

    return res.send( indexHTML );
} );

app.listen( '9000', () => {
    console.log( 'Express server started at http://localhost:9000' );
} );