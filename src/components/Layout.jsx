import React, { useEffect, useState } from 'react';
import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import "../style.scss";
import { ErrorBoundary } from "react-error-boundary";
import SessionTimeout from './modals/SessionTimeout';
import Header from "./globalnav/layout/header/header";
import Footer from "./globalnav/layout/footer/footer";
import { BaseStyles } from "dtk/BaseStyles";
import ProfileComponent from '../mfe/profile/ProfileComponent';
import HomeComponent from 'home/HomeComponent';
import { displayError } from '../common/utilities/functions';
import { LOADER_KEY } from "../common/utilities/constants";
import { WifiLoader } from "react-awesome-loaders-py3";
import { useDispatch } from 'react-redux';
import { loginUser } from "../common/store/userSlice";
import { useSelector, getDarkMode } from "react-redux";
import { H2 } from "dtk/Typography";


const Main = function Layout() {

    const [pageLoader, setPageLoader] = useState(true);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (user && user.loading && user.loading == 'complete') {
            var now = new Date().getTime();
            if (
                now >
                new Date(
                    parseInt(user.state) +
                    parseInt(user.expires_in) * 1000
                ).getTime()
            ) {
                dispatch({ type: "LOGOUT" });
            }
        } else {
            dispatch(loginUser()).catch((err) => {
                displayError({ error: err })
            });
        }
    }, [])

    useEffect(() => {
        if (user && (user.loading) && (user.loading == 'complete') && (user.user_settings) && (user.user_settings.loading) && (user.user_settings.loading == 'complete')) {
            if (document.getElementById('loaderParent'))
                document.getElementById('loaderParent').classList.add("loader-hide");

            setDarkMode(getDarkMode(user));
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .addEventListener("change", ({ matches }) => {
                    setDarkMode(getDarkMode(user));
                    if (getDarkMode(user)) {
                        document.documentElement.setAttribute('data-bs-theme', 'dark');
                    } else {
                        document.documentElement.setAttribute('data-bs-theme', 'light');
                    }
                });
            if (getDarkMode(user)) {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-bs-theme', 'light');
            }
        }
    }, [user])

    const Loader = () => {
        return (
            <div className="loader" id={LOADER_KEY} style={{
                "background": window.matchMedia("(prefers-color-scheme: dark)").matches ? "rgba(0,0,0,1)" : "rgba(255,255,255,0.5)",
            }}>
                <div className="loaderContainer">
                    <WifiLoader
                        background={"transparent"}
                        desktopSize={"150px"}
                        mobileSize={"150px"}
                        text={"Wifi Loader"}
                        backColor="lightblue"
                        frontColor="darkblue"
                    />
                </div>
                <div className="loaderContainerTxt">
                    <H2 darkMode={window.matchMedia("(prefers-color-scheme: dark)").matches ? true : false}>
                        {user ?
                            user.loading ?
                                user.loading == 'complete' ?
                                    user.user_settings ?
                                        user.user_settings.loading == 'complete' ?
                                            'Loading Complete!' : 'Loading Preferences...'
                                        : 'User Loading Complete, Loading Preferences...'
                                    : 'Loading User Data...'
                                : 'Finding User...'
                            : 'Starting login...'}
                    </H2>
                </div>
            </div>
        )
    }

    return (pageLoader) ? (
        <div id="loaderParent" onTransitionEnd={() => {
            setPageLoader(false);
        }}><Loader /></div>)
        : (
            <ErrorBoundary FallbackComponent={displayError}>
                <Router>
                    <Header />
                    <main className="main pt-5 pb-5">
                        <div className="container-fluid" style={{ "height": "100%" }}>
                            <Routes>
                                <Route path="profile" element={
                                    <ProfileComponent />
                                }></Route>
                                <Route
                                    path="*"
                                    element={<Navigate to="/home" />}
                                />
                            </Routes>
                        </div>
                    </main>
                    <Footer />
                    <SessionTimeout />
                </Router>
            </ErrorBoundary>
        );
}

export default Main;