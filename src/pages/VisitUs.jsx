const VisitUs = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        <h2 className="about-title">Besök oss</h2>
        
        <div className="about-content">
          <div className="visit-info">
            <div className="visit-address">
              <h3>Adress</h3>
              <p>Hedvägen 155, 231 66 Trelleborg</p>
            </div>
            <div className="visit-hours">
              <h3>Öppettider</h3>
              <p>Måndag - Fredag: 10:00 - 18:00</p>
              <p>Lördag: 11:00 - 14:00</p>
            </div>
          </div>
          
          <div className="visit-map">
            <iframe
              src="https://www.google.com/maps?q=Hedvägen+155,+231+66+Trelleborg,+Sweden&output=embed"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Seriecentrum Location"
            ></iframe>
          </div>
          
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
            events, turneringar och samlaraktiviteter. Besök oss i butiken eller utforska vårt utbud online.
          </p>
        </div>
      </div>
    </section>
  )
}

export default VisitUs
