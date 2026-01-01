import { useState, useEffect } from 'react';

const NEWS_ITEMS = [
  {
    id: 1,
    title: "Nyt fra community",
    content: "Vi har 1000+ medlemmer! Tak for jeres support og engagement på forumet.",
    date: "I dag"
  },
  {
    id: 2,
    title: "Opdatering: Nyt design",
    content: "Forumet har fået et nyt design med bedre brugeroplevelse og темовалг!",
    date: "2 dage siden"
  },
  {
    id: 3,
    title: "Mødeplan offentliggjort",
    content: "Se tidspunkter for næste måned's møder på vores kalender.",
    date: "1 uge siden"
  },
  {
    id: 4,
    title: "Sikkerhedsopdatering",
    content: "Vi har implementeret to-faktor-autentificering for øget sikkerhed.",
    date: "2 uger siden"
  }
];

const ADS = [
  {
    id: 1,
    title: "🎯 Udannelseskursus",
    content: "Lær webdesign på 4 uger. Kom i gang i dag med 50% rabat!",
    color: "#e3f2fd"
  },
  {
    id: 2,
    title: "💼 Jobtilbud",
    content: "Søger dygtige udviklers! Deltidsstilling som Junior Developer tilgængelig.",
    color: "#f1f8e9"
  },
  {
    id: 3,
    title: "🎨 Design Tools",
    content: "Prøv vores ny design-platform gratis i 30 dage. Ingen kreditkort required.",
    color: "#fce4ec"
  },
  {
    id: 4,
    title: "📚 E-bog gratis",
    content: "Download vores 'Guide til moderne webdev' - Over 200 sider værdifuld viden.",
    color: "#fff3e0"
  },
  {
    id: 5,
    title: "🚀 Startup Program",
    content: "Klar til at lancere dit projekt? Få mentoring og seed-funding.",
    color: "#f3e5f5"
  },
  {
    id: 6,
    title: "🏆 Konference 2026",
    content: "Deltag i årets største tech-konference. Billetterne sælges allerede!",
    color: "#e0f2f1"
  }
];

function RightPanel() {
  const [currentNews, setCurrentNews] = useState(0);
  const [currentAd, setCurrentAd] = useState(0);

  // Roter mellem nyheder hvert 5. sekund
  useEffect(() => {
    const newsInterval = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % NEWS_ITEMS.length);
    }, 8000);
    return () => clearInterval(newsInterval);
  }, []);

  // Roter mellem reklamer hvert 6. sekund
  useEffect(() => {
    const adInterval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ADS.length);
    }, 6000);
    return () => clearInterval(adInterval);
  }, []);

  const news = NEWS_ITEMS[currentNews];
  const ad = ADS[currentAd];

  return (
    <aside className="right-panel">
      <div className="news-box">
        <div className="news-header">
          <h3>📰 Nyhedsfelt</h3>
          <span className="news-indicator">{currentNews + 1} / {NEWS_ITEMS.length}</span>
        </div>
        <div className="news-content">
          <h4>{news.title}</h4>
          <p>{news.content}</p>
          <span className="news-date">{news.date}</span>
        </div>
        <div className="news-dots">
          {NEWS_ITEMS.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentNews ? 'active' : ''}`}
              onClick={() => setCurrentNews(index)}
              title={`Nyheder ${index + 1}`}
              style={{
                backgroundColor: index === currentNews ? 'var(--button-bg)' : 'var(--border-color)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="ad-box" style={{ backgroundColor: ad.color }}>
        <div className="ad-header">
          <h3>🎁 Tilbud og Annonce</h3>
          <span className="ad-indicator">{currentAd + 1} / {ADS.length}</span>
        </div>
        <div className="ad-content">
          <h4>{ad.title}</h4>
          <p>{ad.content}</p>
          <button className="ad-cta">Læs mere →</button>
        </div>
        <div className="ad-dots">
          {ADS.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentAd ? 'active' : ''}`}
              onClick={() => setCurrentAd(index)}
              title={`Annonce ${index + 1}`}
              style={{
                backgroundColor: index === currentAd ? 'var(--button-bg)' : 'rgba(0,0,0,0.2)',
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default RightPanel;