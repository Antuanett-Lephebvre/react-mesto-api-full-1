import { Link } from 'react-router-dom';

function Header(props) {
  const {
    loggedIn, onSignOut, email, currentRoute,
  } = props;

  return (
    <header className="header section page__header">
      <Link
        to="/"
        className="header__logo"
        aria-label="Логотип &laquo;Место. Россия&raquo;"
        rel="noreferrer"
      />
      <div className="header__auth">
        {loggedIn ? (
          <>
            <Link
              to="/profile"
              className="header__button header__button_type_email"
            >
              {email}
            </Link>

            <Link
              to="/signout"
              className="header__button header__button_type_logout "
              onClick={onSignOut}
            >
              Выйти
            </Link>
          </>
        ) : (
          // Отобразить ссылку Регистрация или Войти в зависимости от роута
          <>
            {(currentRoute === '/signin') ? (
              <Link
                to="/signup"
                rel="noreferrer"
                className="header__button header__button_type_register"
              >
                Регистрация
              </Link>
            ) : (
              <Link
                to="/signin"
                rel="noreferrer"
                className="header__button header__button_type_login"
              >
                Войти
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default Header;