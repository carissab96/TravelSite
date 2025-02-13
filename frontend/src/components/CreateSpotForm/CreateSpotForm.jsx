import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSpot } from '../../store/spots';
import './CreateSpotForm.css';

function CreateSpotForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        country: '',
        address: '',
        city: '',
        state: '',
        lat: '',
        lng: '',
        description: '',
        name: '',
        price: ''
    });

    const [imageFiles, setImageFiles] = useState({
        previewImage: null,
        image1: null,
        image2: null,
        image3: null,
        image4: null
    });

    const [imagePreviews, setImagePreviews] = useState({
        previewImage: '',
        image1: '',
        image2: '',
        image3: '',
        image4: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field if it exists
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields
        if (!formData.country) newErrors.country = "Country is required";
        if (!formData.address) newErrors.address = "Street address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        
        // Latitude validation
        if (!formData.lat) {
            newErrors.lat = "Latitude is required";
        } else if (isNaN(formData.lat) || Number(formData.lat) < -90 || Number(formData.lat) > 90) {
            newErrors.lat = "Latitude must be a number between -90 and 90";
        }
        
        // Longitude validation
        if (!formData.lng) {
            newErrors.lng = "Longitude is required";
        } else if (isNaN(formData.lng) || Number(formData.lng) < -180 || Number(formData.lng) > 180) {
            newErrors.lng = "Longitude must be a number between -180 and 180";
        }
        
        // Description validation
        if (!formData.description) {
            newErrors.description = "Description is required";
        } else if (formData.description.length < 30) {
            newErrors.description = "Description needs 30 or more characters";
        }
        
        // Name validation
        if (!formData.name) newErrors.name = "Name is required";
        
        // Price validation
        if (!formData.price) {
            newErrors.price = "Price per night is required";
        } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
            newErrors.price = "Price must be a valid number greater than 0";
        }
        
        // Preview image validation
        if (!imageFiles.previewImage) {
            newErrors.previewImage = "Preview image is required";
        }
        
        // Optional image validations
        ['image1', 'image2', 'image3', 'image4'].forEach(img => {
            if (imageFiles[img] && !imageFiles[img].type.startsWith('image/')) {
                newErrors[img] = "File must be an image";
            }
        });

        return newErrors;
    };

    const handleImageChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) { // 3MB limit
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: 'Image size must be less than 3MB'
                }));
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    [fieldName]: 'File must be an image'
                }));
                return;
            }
            setImageFiles(prev => ({
                ...prev,
                [fieldName]: file
            }));
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({
                    ...prev,
                    [fieldName]: reader.result
                }));
            };
            reader.readAsDataURL(file);
            // Clear any existing error
            if (errors[fieldName]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            // Format data for API
            const lat = parseFloat(formData.lat);
            const lng = parseFloat(formData.lng);
            const price = parseFloat(formData.price);

            if (isNaN(lat) || isNaN(lng) || isNaN(price)) {
                throw new Error('Invalid numeric values');
            }

            // Create form data for the spot
            const spotFormData = new FormData();
            spotFormData.append('address', formData.address.trim());
            spotFormData.append('city', formData.city.trim());
            spotFormData.append('state', formData.state.trim());
            spotFormData.append('country', formData.country.trim());
            spotFormData.append('lat', lat);
            spotFormData.append('lng', lng);
            spotFormData.append('name', formData.name.trim());
            spotFormData.append('description', formData.description.trim());
            spotFormData.append('price', price);

            // Add the preview image
            if (imageFiles.previewImage) {
                spotFormData.append('previewImage', imageFiles.previewImage);
            }

            // Add additional images
            Object.entries(imageFiles)
                .filter(([name, file]) => name !== 'previewImage' && file)
                .forEach(([, file]) => {
                    spotFormData.append('images', file);
                });

            console.log('Submitting spot data:', Object.fromEntries(spotFormData.entries()));

            const response = await dispatch(createSpot(spotFormData));
            
            console.log('Create spot response:', response);
            
            // Check if the action was rejected
            if (response.type === 'spots/createSpot/rejected') {
                const errorMessage = typeof response.payload === 'string' 
                    ? response.payload 
                    : JSON.stringify(response.payload);
                throw new Error(errorMessage);
            }
            
            // Make sure we have a valid response
            if (!response.payload || !response.payload.id) {
                throw new Error('Invalid response from server');
            }
            
            // Success! Navigate to the new spot
            navigate(`/spots/${response.payload.id}`);
        } catch (error) {
            console.error('Error creating spot:', error);
            let errorMessage;
            
            if (error.name === 'TypeError' && error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection.';
            } else if (typeof error.payload === 'string') {
                errorMessage = error.payload;
            } else if (error.message) {
                errorMessage = error.message;
            } else {
                errorMessage = 'An unexpected error occurred. Please try again.';
            }
            
            setErrors({
                submit: errorMessage
            });
            window.scrollTo(0, 0); // Scroll to top to show error
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="create-spot-container">
            <h1>Create a New Spot</h1>
            <form onSubmit={handleSubmit}>
                {/* Location Section */}
                <section className="form-section">
                    <h2>Where&apos;s your place located?</h2>
                    <p>Guests will only get your exact address once they booked a reservation.</p>
                    
                    <div className="input-group">
                        <label>
                            Country
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Country"
                            />
                            {errors.country && <span className="error">{errors.country}</span>}
                        </label>
                    </div>

                    <div className="input-group">
                        <label>
                            Street Address
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                            />
                            {errors.address && <span className="error">{errors.address}</span>}
                        </label>
                    </div>

                    <div className="input-group city-state">
                        <label>
                            City
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="City"
                            />
                            {errors.city && <span className="error">{errors.city}</span>}
                        </label>

                        <label>
                            State
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="State"
                            />
                            {errors.state && <span className="error">{errors.state}</span>}
                        </label>
                    </div>

                    <div className="input-group lat-lng">
                        <label>
                            Latitude
                            <input
                                type="number"
                                name="lat"
                                value={formData.lat}
                                onChange={handleInputChange}
                                placeholder="Latitude (e.g., 37.7645358)"
                                step="any"
                                min="-90"
                                max="90"
                            />
                            {errors.lat && <span className="error">{errors.lat}</span>}
                        </label>

                        <label>
                            Longitude
                            <input
                                type="number"
                                name="lng"
                                value={formData.lng}
                                onChange={handleInputChange}
                                placeholder="Longitude (e.g., -122.4730327)"
                                step="any"
                                min="-180"
                                max="180"
                            />
                            {errors.lng && <span className="error">{errors.lng}</span>}
                        </label>
                    </div>
                </section>

                {/* Description Section */}
                <section className="form-section">
                    <h2>Describe your place to guests</h2>
                    <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                    
                    <div className="input-group">
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Please write at least 30 characters"
                            rows="5"
                        />
                        {errors.description && <span className="error">{errors.description}</span>}
                    </div>
                </section>

                {/* Title Section */}
                <section className="form-section">
                    <h2>Create a title for your spot</h2>
                    <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.</p>
                    
                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Name of your spot"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                </section>

                {/* Price Section */}
                <section className="form-section">
                    <h2>Set a base price for your spot</h2>
                    <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                    
                    <div className="input-group price">
                        <label>
                            <span className="dollar-sign">$</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="Price per night (USD)"
                                min="0"
                                step="0.01"
                            />
                        </label>
                        {errors.price && <span className="error">{errors.price}</span>}
                    </div>
                </section>

                {/* Photos Section */}
                <section className="form-section">
                    <h2>Liven up your spot with photos</h2>
                    <p>Submit a link to at least one photo to publish your spot.</p>
                    
                    <div className="input-group photos">
                        {/* Preview Image */}
                        <div className="image-input-container">
                            <label className="file-input-label">
                                Preview Image (required)
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'previewImage')}
                                    className="file-input"
                                />
                            </label>
                            {imagePreviews.previewImage && (
                                <div className="image-preview">
                                    <img src={imagePreviews.previewImage} alt="Preview" />
                                </div>
                            )}
                            <p className="helper-text">
                                Please select an image file (max size: 5MB)
                            </p>
                            {errors.previewImage && <span className="error">{errors.previewImage}</span>}
                        </div>

                        {/* Additional Images */}
                        {[1, 2, 3, 4].map(num => (
                            <div key={num} className="image-input-container">
                                <label className="file-input-label">
                                    Additional Image {num} (optional)
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, `image${num}`)}
                                        className="file-input"
                                    />
                                </label>
                                {imagePreviews[`image${num}`] && (
                                    <div className="image-preview">
                                        <img src={imagePreviews[`image${num}`]} alt={`Preview ${num}`} />
                                    </div>
                                )}
                                {errors[`image${num}`] && <span className="error">{errors[`image${num}`]}</span>}
                            </div>
                        ))}
                    </div>
                </section>
                {errors.submit && <div className="error submit-error">{errors.submit}</div>}
                
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    Create Spot
                </button>
            </form>
        </div>
    );
}

export default CreateSpotForm;