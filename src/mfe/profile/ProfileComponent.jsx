import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { displayError } from '../../common/utilities/functions';
import { updatePreference, getDarkMode } from '../../common/store/slices/userSlice';
import Card from 'dtk/Card';
import { H3, H2, Subtitle } from 'dtk/Typography';
import { Tabs, Tab } from 'dtk/Tabs';
import Toggle from 'dtk/Toggle';
import { useSelector, useDispatch } from "react-redux";

function ProfileComponent({ vars }) {

    const [selected, setSelected] = useState(0)
    const [systemSetting, setSystemSetting] = useState(false)
    const [darkModeToggle, setDarkModeToggle] = useState(false)
    const [darkModeDisabled, setDarkModeDisabled] = useState(false)
    const [systemSettingDisabled, setSystemSettingDisabled] = useState(false)
    const user = useSelector((state) => state.user);
    const [darkMode, setDarkMode] = useState(false);
    const dispatch = useDispatch();
    const darkModeState = useSelector((state) => {
        if (state.user && state.user.user_settings && state.user.user_settings.preferences) {
            var prefString = JSON.parse(state.user.user_settings.preferences.preferences.replace(/'/g, '"'));
            return prefString.darkMode;
        } else {
            return false;
        }
    });
    const systemSettingState = useSelector((state) => {
        if (state.user && state.user.user_settings && state.user.user_settings.preferences) {
            var prefString = JSON.parse(state.user.user_settings.preferences.preferences.replace(/'/g, '"'));
            return prefString.systemSetting;
        } else {
            return false;
        }
    });

    useEffect(() => {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", ({ matches }) => {
                setDarkMode(getDarkMode(user));
            });
    }, []);

    useEffect(() => {
        setDarkMode(getDarkMode(user))
    }, [darkModeState, user])

    useEffect(() => {
        if (systemSettingState === 'true') {
            setSystemSetting(true)
        } else {
            setSystemSetting(false)
        }
    }, [systemSettingState, user])

    useEffect(() => {
        if (user && user.user_settings && user.user_settings.preferences) {
            var prefString = user.user_settings.preferences.preferences.replace(/'/g, '"');
            var preferences = JSON.parse(prefString)
            if (preferences['systemSetting'] != null) {
                setSystemSetting((preferences['systemSetting'] === 'true') ? true : false)
            } else {
                setSystemSetting(false)
            }
            if (preferences['systemSetting'] === 'true') {
                setDarkModeDisabled(true)
            } else {
                setDarkModeDisabled(false)
            }
            if (preferences['darkMode'] != null) {
                setDarkModeToggle((preferences['darkMode'] === 'true') ? true : false)
            }
        }
    }, [user])

    function updateValue(setting, value, callback) {
        document.querySelectorAll('#preferences button').forEach((button) => {
            button.disabled = true
        })
        const arg_object = {};
        arg_object[setting] = String(value);
        dispatch(updatePreference(arg_object)).then(() => {
            callback();
        });
    }

    return (
        <ErrorBoundary FallbackComponent={displayError}>
            <div className="pt-5 ps-5 pe-5 pb-5 container">
                <div className="row w-100">
                    <div className="align-items-start col">
                        <div
                            id="profile-large"
                            onClick={() => handleActive()}
                            style={{
                                'border-radius': '50%',
                                'width': '10rem',
                                'height': '10rem',
                                'background': 'white',
                                'background-position': '50% 50%',
                                'background-size': '100% 100%',
                                'backgroundImage':
                                    "url(" +
                                    user.picture
                                    + ")",
                            }}
                        />
                    </div>
                    <div className="align-items-end col">
                        <H2 darkMode={darkMode}>{user.name}</H2>
                        <Subtitle darkMode={darkMode}>{user.email}</Subtitle>
                        <Subtitle darkMode={darkMode}>Last Logged In: 11/12/2023</Subtitle>
                    </div>
                </div>
            </div>
            <div className="pt-5 ps-5 pe-5 pb-5 container">
                <div className="row w-100">
                    <div className="col">
                        <Tabs setSelected={setSelected} selected={selected} aria-label="Settings">
                            <Tab name="Settings" darkMode={darkMode}>
                                <div className="pt-3 pb-3 ps-2 pe-2">
                                    <Card
                                        id="preferences"
                                        darkMode={darkMode}
                                    >
                                        <Subtitle darkMode={darkMode} className="pt-2 pb-2">Dark Mode</Subtitle>
                                        <div className="row">
                                            <div className="col pt-2 pb-2">
                                                <label id="systemTheme" htmlFor="systemThemeToggle">
                                                    Use System Theme
                                                </label>
                                            </div>
                                            <div className="col">
                                                <Toggle
                                                    size="small"
                                                    id="systemThemeToggle"
                                                    aria-labelledby="systemTheme"
                                                    checked={systemSetting}
                                                    disabled={systemSettingDisabled}
                                                    darkMode={darkMode}
                                                    onChange={(checked, event) => {
                                                        setSystemSetting(checked)
                                                        updateValue('systemSetting', checked, () => {
                                                            document.querySelectorAll('#preferences button').forEach((button) => {
                                                                button.disabled = false
                                                            })
                                                            if (checked) {
                                                                setDarkModeDisabled(true)
                                                            } else {
                                                                setDarkModeDisabled(false)
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col pt-2 pb-2">
                                                <label id="darkMode" htmlFor="darkModeToggle">
                                                    Dark Mode
                                                </label>
                                            </div>
                                            <div className="col">
                                                <Toggle
                                                    size="small"
                                                    id="darkModeToggle"
                                                    aria-labelledby="darkMode"
                                                    disabled={darkModeDisabled}
                                                    checked={darkModeToggle}
                                                    darkMode={darkMode}
                                                    onChange={(checked, event) => {
                                                        setDarkModeToggle(checked)
                                                        updateValue('darkMode', checked, () => {
                                                            document.querySelectorAll('#preferences button').forEach((button) => {
                                                                button.disabled = false
                                                            })
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </Tab>
                            <Tab darkMode={darkMode} name="Tab Two">Tab Content Two</Tab>
                            <Tab darkMode={darkMode} name="Tab Three">Tab Content Three</Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default ProfileComponent;