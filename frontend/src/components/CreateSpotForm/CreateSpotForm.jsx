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
        previewImage: '',
        image1: '',
        image2: '',
        image3: '',
        image4: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields
        if (!formData.country) newErrors.country = "Country is required";
        if (!formData.address) newErrors.address = "Street address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        
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
        if (!formData.previewImage) {
            newErrors.previewImage = "Preview image is required";
        } else if (!isValidImageUrl(formData.previewImage)) {
            newErrors.previewImage = "Preview image must end in .png, .jpg, or .jpeg";
        }
        
        // Optional image validations
        ['image1', 'image2', 'image3', 'image4'].forEach(img => {
            if (formData[img] && !isValidImageUrl(formData[img])) {
                newErrors[img] = "Image URL must end in .png, .jpg, or .jpeg";
            }
        });

        // Latitude validation (optional)
        if (formData.lat && formData.lat.trim() !== '') {
            const lat = parseFloat(formData.lat);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                newErrors.lat = "Latitude must be between -90 and 90";
            }
        }

        // Longitude validation (optional)
        if (formData.lng && formData.lng.trim() !== '') {
            const lng = parseFloat(formData.lng);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                newErrors.lng = "Longitude must be between -180 and 180";
            }
        }

        return newErrors;
    };

    const isValidImageUrl = (url) => {
        if (!url) return true; // Empty URLs are handled by required field validation
        return url.match(/\.(jpg|jpeg|png)$/i);
    };

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

    const handleSubmit = async (e) => {
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
            const spotData = {
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim(),
                lat: formData.lat ? parseFloat(formData.lat) : null,
                lng: formData.lng ? parseFloat(formData.lng) : null,
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                images: [
                    { url: formData.previewImage.trim(), preview: true },
                    ...[formData.image1, formData.image2, formData.image3, formData.image4]
                        .filter(url => url && url.trim())
                        .map(url => ({ url: url.trim(), preview: false }))
                ]
            };

            const result = await dispatch(createSpot(spotData)).unwrap();
            navigate(`/spots/${result.id}`);
        } catch (error) {
            console.error('Error creating spot:', error);
            let errorMessage = "An error occurred while creating the spot. Please try again.";
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.errors) {
                // Handle validation errors
                const validationErrors = {};
                Object.entries(error.errors).forEach(([field, message]) => {
                    validationErrors[field] = message;
                });
                setErrors(validationErrors);
                return;
            }
            
            setErrors({
                submit: errorMessage
            });
            window.scrollTo(0, 0); // Scroll to top to show error
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            Latitude (optional)
                            <input
                                type="text"
                                name="lat"
                                value={formData.lat}
                                onChange={handleInputChange}
                                placeholder="Latitude"
                            />
                            {errors.lat && <span className="error">{errors.lat}</span>}
                        </label>

                        <label>
                            Longitude (optional)
                            <input
                                type="text"
                                name="lng"
                                value={formData.lng}
                                onChange={handleInputChange}
                                placeholder="Longitude"
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
                        <input
                            type="text"
                            name="previewImage"
                            value={formData.previewImage}
                            onChange={handleInputChange}
                            placeholder="Preview Image URL"
                        />
                        {errors.previewImage && <span className="error">{errors.previewImage}</span>}

                        {[1, 2, 3, 4].map(num => (
                            <div key={num}>
                                <input
                                    type="text"
                                    name={`image${num}`}
                                    value={formData[`image${num}`]}
                                    onChange={handleInputChange}
                                    placeholder="Image URL"
                                />
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