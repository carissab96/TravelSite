import configureStore from "./index";

const store = configureStore();

// Make store available in dev tools in both modes
if (import.meta.env.MODE === 'production') {
    window.store = store;
} else {
    window.store = store;
}

export default store;