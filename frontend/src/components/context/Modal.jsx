import { useRef, createContext, useContext, useState } from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

const ModalContext = createContext();

function ModalProvider({ children }) {
    const modalRef = useRef();
    const [modalContent, setModalContent] = useState(null);
    const [onModalClose, setOnModalClose] = useState(null);

    const closeModal = () => {
        setModalContent(null); //clear the modal contents
        // If callback function is truthy, call the callback function and reset it
        // to null:
        if (typeof onModalClose === "function") {
            setOnModalClose(null);
            onModalClose();
        }
    };

    const contextValue = {
        modalRef, //reference to modal div
        modalContent, //React component to render inside modal
        setModalContent, //function to set the React component to render inside modal
        onModalClose, //callback function called when modal is closing
        setOnModalClose, //function to set the callback function called when modal is closing
        closeModal //function to close the modal
    };

    return (
        <>
      <ModalContext.Provider value={contextValue}>
        {children}
      </ModalContext.Provider>
      <div ref={modalRef} />
    </>
  );
}

export function Modal() {
    const { modalRef, modalContent, closeModal} = useContext(ModalContext);
    //If there is no div referenced by the modalRef or modalContent is not a truthy value, render nothing;
    if (!modalRef || !modalRef.current || !modalContent) return null;

    //Render the following component tot he div referenced by the modalRef
    return ReactDOM.createPortal(
        <div id="modal">
            <div id="modal-background" onClick={closeModal} />
            <div id="modal-content">{modalContent}</div>
        </div>,
        modalRef.current
    );
}

export function useModal() {
    return useContext(ModalContext);
}

export { ModalProvider };
export default ModalContext;