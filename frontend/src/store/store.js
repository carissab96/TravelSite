import configureStore from "./index";

const store = configureStore();

if (import.meta.env.MODE === 'production') {
    window.Storage = store;
}

export default store;