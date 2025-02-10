import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateSpot, fetchSpotDetails } from '../../store/spots';
import './UpdateSpot.css';

const UpdateSpot = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { spotId } = useParams();
    const spot = useSelector(state => state.spots.singleSpot);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        country: '',
        lat: '',
        lng: '',
        name: '',
        description: '',
        price: ''
    });

    useEffect(() => {
        const loadSpot = async () => {
            try {
                await dispatch(fetchSpotDetails(spotId));
            } catch (error) {
                console.error('Error loading spot:', error);
                navigate('/spots/current');
            }
            setIsLoading(false);
        };
        loadSpot();
    }, [dispatch, spotId, navigate]);

    useEffect(() => {
        if (spot) {
            setFormData({
                address: spot.address || '',
                city: spot.city || '',
                state: spot.state || '',
                country: spot.country || '',
                lat: spot.lat || '',
                lng: spot.lng || '',
                name: spot.name || '',
                description: spot.description || '',
                price: spot.price || ''
            });
        }
    }, [spot]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.address) newErrors.address = 'Street address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.lat || formData.lat < -90 || formData.lat > 90) {
            newErrors.lat = 'Latitude must be between -90 and 90';
        }
        if (!formData.lng || formData.lng < -180 || formData.lng > 180) {
            newErrors.lng = 'Longitude must be between -180 and 180';
        }
        if (!formData.name || formData.name.length > 50) {
            newErrors.name = 'Name must be less than 50 characters';
        }
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await dispatch(updateSpot({ 
                spotId, 
                spotData: formData 
            }));
            navigate(`/spots/${spotId}`);
        } catch (error) {
            console.error('Error updating spot:', error);
            setErrors({ submit: error.message });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="update-spot-container">
            <h1>Update your Spot</h1>
            <form onSubmit={handleSubmit} className="update-spot-form">
                {errors.submit && <div className="error">{errors.submit}</div>}
                
                <section className="location-section">
                    <h2>Where's your place located?</h2>
                    <p>Guests will only get your exact address once they book a reservation.</p>
                    
                    <div className="form-group">
                        <label>Street Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Disney Lane"
                        />
                        {errors.address && <span className="error">{errors.address}</span>}
                    </div>

                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="San Francisco"
                        />
                        {errors.city && <span className="error">{errors.city}</span>}
                    </div>

                    <div className="form-group">
                        <label>State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="California"
                        />
                        {errors.state && <span className="error">{errors.state}</span>}
                    </div>

                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="United States"
                        />
                        {errors.country && <span className="error">{errors.country}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Latitude</label>
                            <input
                                type="number"
                                name="lat"
                                value={formData.lat}
                                onChange={handleChange}
                                placeholder="37.7645358"
                            />
                            {errors.lat && <span className="error">{errors.lat}</span>}
                        </div>

                        <div className="form-group">
                            <label>Longitude</label>
                            <input
                                type="number"
                                name="lng"
                                value={formData.lng}
                                onChange={handleChange}
                                placeholder="-122.4730327"
                            />
                            {errors.lng && <span className="error">{errors.lng}</span>}
                        </div>
                    </div>
                </section>

                <section className="description-section">
                    <h2>Describe your place to guests</h2>
                    <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                    
                    <div className="form-group">
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please write at least 30 characters"
                            rows="5"
                        />
                        {errors.description && <span className="error">{errors.description}</span>}
                    </div>
                </section>

                <section className="title-section">
                    <h2>Create a title for your spot</h2>
                    <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
                    
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name of your spot"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                </section>

                <section className="price-section">
                    <h2>Set a base price for your spot</h2>
                    <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                    
                    <div className="form-group price-input">
                        <span className="dollar-sign">$</span>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Price per night (USD)"
                        />
                        {errors.price && <span className="error">{errors.price}</span>}
                    </div>
                </section>

                <button type="submit" className="submit-button">
                    Update Spot
                </button>
            </form>
        </div>
    );
};

export default UpdateSpot;
