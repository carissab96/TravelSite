import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from './../context/Modal';
import { deleteSpot } from '../../store/spots';
import './DeleteSpotModal.css';

function DeleteSpotModal({ spotId, onSuccess }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState({});
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        setIsDeleting(true);
        setErrors({});

        try {
            const response = await dispatch(deleteSpot(spotId));
            if (response.error) {
                setErrors({ delete: 'Failed to delete spot' });
            } else {
                closeModal();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            setErrors({ delete: 'An unexpected error occurred' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="delete-modal-container">
            <div className="modal-header">
                <h1>Confirm Delete</h1>
                <button 
                    type="button" 
                    className="close-button" 
                    onClick={closeModal}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            <div className="modal-content">
                <p>Are you sure you want to delete this spot?</p>
                <p className="warning-text">This action cannot be undone.</p>
                
                {errors.delete && (
                    <p className="error-text">{errors.delete}</p>
                )}

                <div className="button-group">
                    <button 
                        className="cancel-button"
                        onClick={closeModal}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        className="delete-button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete Spot'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteSpotModal;