import React from 'react';
import "./base.scss";
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import App from "./App/App";
import {BrowserRouter} from "react-router-dom";
import {grey} from "@material-ui/core/colors";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {MuiThemeProvider} from "@material-ui/core";
import {SimplePaletteColorOptions} from "@material-ui/core/styles";

const primary: SimplePaletteColorOptions = {
	main: "#000",
	contrastText: "#FFFFFF",
	dark: "#222",
	light: "#EEE"
};

const theme = createMuiTheme({
	palette: {
		primary,
		secondary: grey,
	},
});

ReactDOM.render(
	<BrowserRouter>
		<MuiThemeProvider theme={theme}>
			<App/>
		</MuiThemeProvider>
	</BrowserRouter>
	, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();