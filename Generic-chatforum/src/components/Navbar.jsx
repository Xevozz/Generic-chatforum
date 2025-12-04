

function Navbar() {
  return (
    <header className="navbar">
      {/* Venstre side */}
      <div className="navbar-left">
        <span className="navbar-app-title">Chat Forum</span>
      </div>

      {/* Midten */}
      <div className="navbar-center">
        <input
          type="text"
          className="navbar-search"
          placeholder="Søgefelt"
        />
        <div className="navbar-page-title">Alle opslag</div>
      </div>

      {/* Højre side */}
      <div className="navbar-right">
        <button className="btn btn-outline">Lav opslag</button>
        <button className="btn btn-primary">Log ind</button>
      </div>
    </header>
  );
}

export default Navbar;