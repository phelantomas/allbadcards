import * as React from "react";
import {useEffect, useState} from "react";
import {AppBar, DialogTitle} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CardMedia from '@material-ui/core/CardMedia';
import Container from "@material-ui/core/Container";
import {makeStyles} from "@material-ui/styles";
import CardContent from "@material-ui/core/CardContent";
import {Routes} from "./Routes";
import {UserDataStore} from "../Global/DataStore/UserDataStore";
import styled from "@material-ui/styles/styled";
import Paper from "@material-ui/core/Paper";
import {MdPeople, MdShare} from "react-icons/all";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import {GameRoster} from "../Areas/Game/Components/GameRoster";
import {Link, matchPath} from "react-router-dom";
import {CopyGameLink} from "../UI/CopyGameLink";
import {GameDataStore} from "../Global/DataStore/GameDataStore";
import {useHistory} from "react-router";
import {SiteRoutes} from "../Global/Routes/Routes";
import ReactGA from "react-ga";
import classNames from "classnames";
import Helmet from "react-helmet";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles({
	logoIcon: {
		height: "2rem",
		width: "auto",
		paddingRight: "1rem"
	},
	settingsButton: {
		minWidth: 0,
		fontSize: "1.5rem",
	},
	firstButton: {
		minWidth: 0,
		marginLeft: "auto",
		fontSize: "1.5rem"
	},
	rosterButton: {
		minWidth: 0,
		fontSize: "1.5rem"
	},
	logo: {
		color: "#000",
		textDecoration: "none",
		display: "flex",
		alignItems: "center",
		fontWeight: 700
	},
	appBar: {
		padding: "0 1rem"
	},
	centerBar: {
		display: "flex",
		justifyContent: "center"
	}
});

const OuterContainer = styled(Container)({
	background: "#EEE",
	minHeight: "100vh",
	width: "100%",
	padding: 0,
	maxWidth: "none"
});

const App: React.FC = () =>
{
	const classes = useStyles();

	const [rosterOpen, setRosterOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);

	const history = useHistory();

	const isGame = !!matchPath(history.location.pathname, SiteRoutes.Game.path);
	const isHome = history.location.pathname === "/";

	const appBarClasses = classNames(classes.appBar, {
		[classes.centerBar]: isHome
	});

	useEffect(() =>
	{
		UserDataStore.initialize();
		history.listen(() =>
		{
			UserDataStore.initialize();
			ReactGA.pageview(window.location.pathname + window.location.search);
		});
	}, []);

	const date = new Date();
	const year = date.getFullYear();
	const isFamilyMode = location.hostname.startsWith("not.");

	const mobile = useMediaQuery('(max-width:600px)');

	const titleDefault = isFamilyMode
		? "(Not) All Bad Cards | Play the Family Edition of Cards Against Humanity online!"
		: "All Bad Cards | Play Cards Against Humanity online!";

	const template = isFamilyMode
		? "(Not) All Bad Cards"
		: "All Bad Cards";

	const familyEdition = isFamilyMode ? " (Family Edition)" :"";

	return (
		<div>
			<Helmet titleTemplate={`%s | ${template}`} defaultTitle={titleDefault}>
				<meta name="description" content={`Play Cards Against Humanity${familyEdition} online, for free! Over 10,000 cards in total. Play with friends over video chat, or in your house with your family. `}/>
			</Helmet>
			<OuterContainer>
				<Paper elevation={10}>
					<Container maxWidth={"md"} style={{position: "relative", padding: 0, background: "#FFF", minHeight: "100vh"}}>
						<CardMedia>
							<AppBar color={"transparent"} position="static" elevation={0}>
								<Toolbar className={appBarClasses}>
									<Typography variant={mobile ? "body1" : "h5"}>
										<Link to={"/"} className={classes.logo}>
											{!mobile || !isFamilyMode && <img className={classes.logoIcon} src={"/logo-small.png"}/>}
											{isFamilyMode ? "(not) " : ""} all bad cards
										</Link>
									</Typography>
									{isGame && (
										<>
											<Button aria-label={"Share"} className={classes.firstButton} size={"large"} onClick={() => setShareOpen(true)}>
												<MdShare/>
											</Button>
											<Button aria-label={"Scoreboard"} className={classes.rosterButton} size={"large"} onClick={() => setRosterOpen(true)}>
												<MdPeople/>
											</Button>
										</>
									)}
								</Toolbar>
							</AppBar>
						</CardMedia>
						<CardContent style={{paddingTop: 0}}>
							<Routes/>
						</CardContent>
					</Container>
					<div style={{textAlign: "center", padding: "0.5rem 0"}}>
						<Button style={{margin: "1rem 0 2rem"}} color={"primary"} variant={"contained"} component={p => <a {...p} href={"https://github.com/jakelauer/allbadcards/issues/new"} target={"_blank"} rel={"noreferrer nofollow"}/>}>
							Report a Problem
						</Button>
						<Typography>
							&copy; {year}. Created by <a href={"http://jakelauer.com"}>Jake Lauer</a> (<a href={"https://reddit.com/u/HelloControl_"}>HelloControl_</a>)
						</Typography>
					</div>
				</Paper>
			</OuterContainer>
			<Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
				<DialogContent style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<Typography variant={"h4"}>Game: {GameDataStore.state.game?.id}</Typography>
					<br/>
					<br/>
					<CopyGameLink buttonSize={"large"}/>
				</DialogContent>
			</Dialog>
			<Dialog open={rosterOpen} onClose={() => setRosterOpen(false)}>
				<DialogTitle id="form-dialog-title">Game Roster</DialogTitle>
				<DialogContent>
					<GameRoster/>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default App;