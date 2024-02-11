import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { STATE } from "../../utilities/constants";

let preferencesUrl = "https://user-prefs.suncoast.systems";
let googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
let googleProfileUrl =
  "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=";
let googleClientId = "488218567442-uj3hsd9g13so40fgc89srllfeoiuqeer.apps.googleusercontent.com";

export const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
};

export const getDarkMode = (user) => {
  if (user && user.user_settings && user.user_settings.preferences) {
    var prefString = JSON.parse(
      user.user_settings.preferences.preferences.replace(/'/g, '"')
    );
    if (prefString.systemSetting === "true") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? true
        : false;
    } else {
      return prefString.darkMode === "true" ? true : false;
    }
  } else {
    return false;
  }
};

export const updatePreference = createAsyncThunk(
  "user/updatePreference",
  async (arg, thunkAPI) => {
    var currentPrefsObj = thunkAPI.getState().user.user_settings.preferences.preferences.replace(
      /'/g,
      '"'
    );
    var currentPreferences = JSON.parse(currentPrefsObj);

    Object.keys(arg).forEach((key) => {
      currentPreferences[key] = arg[key];
    });
    return await axios(preferencesUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${thunkAPI.getState().user.access_token}`,
      },
      data: currentPreferences,
    })
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  }
);

export const fetchPreferences = createAsyncThunk(
  "user/fetchPreferences",
  async (arg, thunkAPI) => {
    return await axios(preferencesUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${arg.access_token}`,
        Identity: arg.id_token,
      },
    })
      .then((response) => {
        return response.data
      })
      .catch((error) => {
        throw error;
      });
  }
);

export const fetchGoogleProfile = createAsyncThunk(
  "user/fetchGoogleProfile",
  async (arg, thunkAPI) => {
    return await axios(googleProfileUrl + arg, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  }
);

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (arg, thunkAPI) => {
    if (!thunkAPI.getState().user || !thunkAPI.getState().user.access_token) {
      var fragmentString = window.location.hash.substring(1);
      var params = {};
      var regex = /([^&=]+)=([^&]*)/g,
        m;
      while ((m = regex.exec(fragmentString))) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      }

      if (Object.keys(params).length > 0) {
        if (params["state"] && params["state"] == localStorage.getItem(STATE)) {
          window.location.hash = "";
          return await new Promise((resolve, reject) => {
            resolve(params);
            thunkAPI.dispatch(fetchGoogleProfile(params.access_token));
            thunkAPI.dispatch(fetchPreferences({
              'access_token':params.access_token, 
              'id_token': params.id_token
            }));
            localStorage.removeItem(STATE);
          });
        }
      } else {
        var form = document.createElement("form");
        form.setAttribute("method", "GET"); // Send as a GET request.
        form.setAttribute("action", googleAuthUrl);
        // Parameters to pass to OAuth 2.0 endpoint.
        if (localStorage.getItem(STATE)) {
          localStorage.removeItem(STATE);
        }
        var now = new Date();
        localStorage.setItem(STATE, now.getTime());
        var params = {
          client_id: googleClientId,
          redirect_uri: window.location.protocol + "//" + window.location.host,
          scope: "email profile openid",
          state: localStorage.getItem(STATE),
          include_granted_scopes: "true",
          nonce: "testnonce",
          response_type: "token id_token",
        };

        // Add form parameters as hidden input values.
        for (var p in params) {
          var input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", p);
          input.setAttribute("value", params[p]);
          form.appendChild(input);
        }

        // Add form to page and submit it to open the OAuth 2.0 endpoint.
        document.body.appendChild(form);
        form.submit();
      }
    } else {
      var now = new Date().getTime();
      if (
        now >
        new Date(
          parseInt(thunkAPI.getState().user.state) +
            parseInt(thunkAPI.getState().user.expires_in) * 1000
        ).getTime()
      ) {
        thunkAPI.dispatch({ type: "LOGOUT" });
      }
    }
  }
);

export const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(loginUser.fulfilled, (state, action) => {
      if (action.payload) {
        Object.keys(action.payload).forEach((key) => {
          state[key] = action.payload[key];
        });
      }
    });
    builder.addCase(fetchGoogleProfile.fulfilled, (state, action) => {
      if (action.payload) {
        Object.keys(action.payload).forEach((key) => {
          state[key] = action.payload[key];
        });
      }
      state.loading = 'complete';
    });
    builder.addCase(fetchPreferences.fulfilled, (state, action) => {
      if (!state.user_settings) {
        state.user_settings = {};
      }
      if (action.payload) {
        Object.keys(action.payload).forEach((key) => {
          state.user_settings[key] = action.payload[key];
        });
      }
      state.user_settings.loading = 'complete';
    });
    builder.addCase(updatePreference.fulfilled, (state, action) => {
      if (action.payload) {
        var currentPrefsObj = state.user_settings.preferences.preferences.replace(
          /'/g,
          '"'
        );
        var currentPreferences = JSON.parse(currentPrefsObj);

        var newPrefsObj = action.payload.preferences.preferences.replace(/'/g, '"');
        var newPreferences = JSON.parse(newPrefsObj);
        Object.keys(newPreferences).forEach((key) => {
          currentPreferences[key] = newPreferences[key];
        });
        state.user_settings.preferences.preferences = JSON.stringify(
          currentPreferences
        ).replace(/"/g, "'");
      }
    });
  },
});

export const { fetchUserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;
