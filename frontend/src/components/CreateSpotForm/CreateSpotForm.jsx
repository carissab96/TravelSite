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
        price: '',
        previewImage: '',  // URL for preview image
        image1: '',        // URL for additional image 1
        image2: '',        // URL for additional image 2
        image3: '',        // URL for additional image 3
        image4: ''         // URL for additional image 4
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
        if (!formData.name) {
            newErrors.name = "Name is required";
        } else if (formData.name.length > 50) {
            newErrors.name = "Name must be less than 50 characters";
        }
        
        // Price validation
        if (!formData.price) {
            newErrors.price = "Price per night is required";
        } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
            newErrors.price = "Price must be a valid number greater than 0";
        }
        
        // Preview image URL validation
        if (!formData.previewImage) {
            newErrors.previewImage = "Preview image URL is required";
        }

        return newErrors;
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
            const spotData = {
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim(),
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng),
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                images: [
                    { url: formData.previewImage.trim(), preview: true }
                ]
            };

            // Add optional images if they exist
            ['image1', 'image2', 'image3', 'image4'].forEach(img => {
                if (formData[img]) {
                    spotData.images.push({ 
                        url: formData[img].trim(), 
                        preview: false 
                    });
                }
            });

            const response = await dispatch(createSpot(spotData));
            
            if (response.error) {
                setErrors(response.error);
            } else if (response.payload && response.payload.spot) {
                // Navigate to the new spot's page
                navigate(`/spots/${response.payload.spot.id}`);
            } else {
                setErrors({
                    submit: 'Failed to get spot details after creation'
                });
            }
        } catch (error) {
            setErrors({
                submit: 'An error occurred while creating the spot. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="create-spot-container">
            <h1>Create a New Spot</h1>
            <form onSubmit={handleSubmit} className="create-spot-form">
                {/* Location Info */}
                <section className="form-section">
                    <h2>Where is your place located?</h2>
                    <p>Guests will only get your exact address once they book a reservation.</p>
                    
                    <div className="input-group">
                        <label>Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Country"
                        />
                        {errors.country && <span className="error">{errors.country}</span>}
                    </div>

                    <div className="input-group">
                        <label>Street Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Address"
                        />
                        {errors.address && <span className="error">{errors.address}</span>}
                    </div>

                    <div className="input-group">
                        <label>City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                        />
                        {errors.city && <span className="error">{errors.city}</span>}
                    </div>

                    <div className="input-group">
                        <label>State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                        />
                        {errors.state && <span className="error">{errors.state}</span>}
                    </div>

                    <div className="input-group">
                        <label>Latitude</label>
                        <input
                            type="number"
                            name="lat"
                            value={formData.lat}
                            onChange={handleInputChange}
                            placeholder="Latitude"
                            step="any"
                        />
                        {errors.lat && <span className="error">{errors.lat}</span>}
                    </div>

                    <div className="input-group">
                        <label>Longitude</label>
                        <input
                            type="number"
                            name="lng"
                            value={formData.lng}
                            onChange={handleInputChange}
                            placeholder="Longitude"
                            step="any"
                        />
                        {errors.lng && <span className="error">{errors.lng}</span>}
                    </div>
                </section>

                {/* Description */}
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

                {/* Title */}
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

                {/* Price */}
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

                {/* Photos */}
                <section className="form-section">
                    <h2>Liven up your spot with photos</h2>
                    <p>Submit a link to at least one photo to publish your spot.</p>
                    
                    <div className="input-group">
                        <label>Preview Image URL (required)</label>
                        <input
                            type="text"
                            name="previewImage"
                            value={formData.previewImage}
                            onChange={handleInputChange}
                            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                            className="url-input"
                        />
                        {errors.previewImage && <span className="error">{errors.previewImage}</span>}
                    </div>

                    {[1, 2, 3, 4].map(num => (
                        <div key={num} className="input-group">
                            <label>Image URL {num} (optional)</label>
                            <input
                                type="text"
                                name={`image${num}`}
                                value={formData[`image${num}`]}
                                onChange={handleInputChange}
                                placeholder="Enter image URL (optional)"
                                className="url-input"
                            />
                            {errors[`image${num}`] && <span className="error">{errors[`image${num}`]}</span>}
                        </div>
                    ))}
                </section>

                {errors.submit && <div className="error submit-error">{errors.submit}</div>}
                
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Spot'}
                </button>
            </form>
        </div>
    );
}

export default CreateSpotForm;