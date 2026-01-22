import { useState, useEffect } from 'react'
import TournamentWidget from '../components/TournamentWidget'

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(4) // Start with slide 5 (index 4)
  const slides = [
    { image: '/images/banner1.jpg', alt: 'Banner 1' },
    { image: '/images/banner2.jpg', alt: 'Banner 2' },
    { image: '/images/banner3.jpg', alt: 'Banner 3' },
    { image: '/images/banner4.webp', alt: 'Banner 4' },
    { image: '/images/banner5.jpg', alt: 'Banner 5' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <>
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-carousel">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={slide.image} alt={slide.alt} className="hero-image" />
              <div className="hero-overlay"></div>
            </div>
          ))}
        </div>
        
        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>

      {/* Catalog Section */}
      <section className="catalog-section">
        <div className="catalog-container">
          <div className="catalog-header">
            <h2 className="catalog-title">KATALOG</h2>
            <div className="catalog-description-small">
              <p>Vi har ett av Sveriges största lager av serietidningar med tusentals titlar från klassiker till nyutgivningar. Vårt omfattande sortiment täcker allt från populära superhjälteserier till oberoende serier och manga. Oavsett vad du letar efter, finns det garanterat i vårt stora lager!</p>
            </div>
          </div>

          <div className="catalog-covers">
            <div className="cover-item">
              <img src="/images/Serie1.jpg" alt="Serie 1" className="cover-image" />
              <div className="cover-info">
                <div className="cover-title">The Flash #773</div>
                <div className="cover-price">299 kr</div>
              </div>
            </div>
            <div className="cover-item">
              <img src="/images/Serie2.jpg" alt="Serie 2" className="cover-image" />
              <div className="cover-info">
                <div className="cover-title">The Chainman #4</div>
                <div className="cover-price">159 kr</div>
              </div>
            </div>
            <div className="cover-item">
              <img src="/images/Serie3.jpg" alt="Serie 3" className="cover-image" />
              <div className="cover-info">
                <div className="cover-title">The Amazing Spider-Man: Miles Morales #34</div>
                <div className="cover-price">259 kr</div>
              </div>
            </div>
            <div className="cover-item">
              <img src="/images/Serie4.jpg" alt="Serie 4" className="cover-image" />
              <div className="cover-info">
                <div className="cover-title">The Uncanny X-Men</div>
                <div className="cover-price">399 kr</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Widget */}
      <TournamentWidget />

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="about-title">Om Seriecentrum</h2>
          <div className="about-content">
            <p className="about-text">
              Seriecentrum är Sveriges sydligaste seriebutik, grundad 1990 i hjärtat av Trelleborg. 
              Sedan över 30 år har vi varit en trogen destination för seriefantaster, samlare och 
              spelentusiaster i hela Skåne och övriga Sverige.
            </p>
            <p className="about-text">
              Vår passion för serier, samlarkort och brädspel har gjort oss till en av regionens 
              mest respekterade butiker. Vi erbjuder ett omfattande sortiment av serietidningar, 
              seriealbum, Magic: The Gathering produkter, PVC-figurer och brädspel för alla åldrar 
              och intressen.
            </p>
            <p className="about-text">
              Hos oss hittar du allt från klassiska serier och nyutgivningar till exklusiva 
              samlartidningar och sällsynta kort. Vårt team består av kunniga medarbetare som 
              delar din passion och alltid är redo att hjälpa dig hitta precis det du letar efter.
            </p>
            <p className="about-text">
              Vi tror på att bygga en gemenskap kring våra produkter och arrangerar regelbundet 
              events, turneringar och samlaraktiviteter. Besök oss i butiken på Hedvägen 155 i 
              Trelleborg eller utforska vårt utbud online.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
