
const Contact = () => {
  return (
    <section className="page-section">
      <div className="page-container">
        <h1 className="page-title">Kontakta Oss</h1>
        <p className="page-description">Kontakta oss för frågor eller beställningar</p>
        
        <div className="contact-content">
          <div className="contact-info-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3 className="contact-card-title">Telefon</h3>
              <p className="contact-card-text">
                <a href="tel:041014151" className="contact-link">0410-141 51</a>
              </p>
              <p className="contact-card-subtext">Ring oss under öppettider</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3 className="contact-card-title">E-post</h3>
              <p className="contact-card-text">
                <a href="mailto:seriecentrum@hotmail.com" className="contact-link">seriecentrum@hotmail.com</a>
              </p>
              <p className="contact-card-subtext">Skriv så detaljerat som möjligt och ange i ämnesraden vad saken gäller, t.ex. Förfrågan, Beställning, m.m.</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="contact-card-title">Adress</h3>
              <p className="contact-card-text">
                Hedvägen 155<br />
                231 66 Trelleborg
              </p>
              <p className="contact-card-subtext">Besök oss i butiken</p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="contact-card-title">Öppettider</h3>
              <p className="contact-card-text">
                Måndag - Fredag: 10:00 - 18:00<br />
                Lördag: 11:00 - 14:00<br />
                Söndag: Stängt
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
