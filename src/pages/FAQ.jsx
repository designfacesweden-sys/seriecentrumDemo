
const FAQ = () => {
  return (
    <section className="page-section">
      <div className="page-container">
        <h1 className="page-title">Vanliga Frågor</h1>
        <p className="page-description">Svar på vanliga frågor</p>
        <div className="info-content">
          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">Hur gör jag en beställning?</h3>
              <p className="faq-answer">Du kan beställa via e-post eller telefon. Skicka en detaljerad förfrågan till seriecentrum@hotmail.com eller ring oss på 0410-141 51.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Vilka betalningsmetoder accepterar ni?</h3>
              <p className="faq-answer">Vi accepterar banköverföring och faktura. Du får betalningsinformation via e-post efter att beställningen är bekräftad.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Hur lång leveranstid har ni?</h3>
              <p className="faq-answer">Leveranstiden varierar beroende på produkt och lagerstatus. Kontakta oss för mer information om specifika produkter.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Kan jag besöka er butik?</h3>
              <p className="faq-answer">Ja, vi har öppet måndag-fredag 10:00-18:00 och lördag 11:00-14:00 på Hedvägen 155, 231 66 Trelleborg.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
