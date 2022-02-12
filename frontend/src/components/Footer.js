function Footer() {
  return (
    <footer className="footer page__footer">
      <p className="footer__copyright">
        ©
        {' '}
        {new Date().getFullYear()}
        {' '}
        Mesto Russia && Vladimir Krylov
      </p>
    </footer>
  );
}

export default Footer;
