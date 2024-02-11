import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import "./style.scss";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "common/store";
import { Provider } from "react-redux";
import { GlobalStore } from 'redux-micro-frontend';

function renderToDOM() {
  GlobalStore.Get().RegisterStore("config", store);
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Layout />
        </PersistGate>
      </Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

renderToDOM();
export { renderToDOM };
