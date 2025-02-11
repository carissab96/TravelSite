import './About.css';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

function About() {
    return (
        <div className="about-container">
            <h1>Welcome to TravelSite</h1>
            <div className="about-content">
                <section className="about-intro">
                    <h2>Your Home Away From Home</h2>
                    <p>
                        TravelSite is your gateway to unique stays and experiences around the world. 
                        Whether you&apos;re looking for a cozy cabin in the woods, a beachfront paradise, 
                        or an urban oasis, we&apos;ve got you covered.
                    </p>
                </section>

                <section className="about-features">
                    <h2>What We Offer</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <h3>Find Your Perfect Stay</h3>
                            <p>Browse through our curated selection of properties, each with detailed descriptions and high-quality photos.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Share Your Space</h3>
                            <p>Have a unique property? Become a host and share your space with travelers from around the world.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Real Reviews</h3>
                            <p>Read authentic reviews from our community of travelers to make informed decisions about your stay.</p>
                        </div>
                    </div>
                </section>

                <section className="about-mission">
                    <h2>Our Mission</h2>
                    <p>
                        We believe that travel should be personal and memorable. Our mission is to connect 
                        travelers with unique accommodations and create unforgettable experiences. Whether 
                        you&apos;re a guest looking for your next adventure or a host sharing your special space, 
                        we&apos;re here to make the journey amazing.
                    </p>
                </section>

                <section className="about-contact">
                    <h2>Contact Us</h2>
                    <div className="contact-info">
                        <p><FaEnvelope /> info@TravelSite.com</p>
                        <p><FaPhone /> 1-800-TRAVELS</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default About;
