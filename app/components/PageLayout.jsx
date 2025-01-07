import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {PrivateHeader} from '~/components/PrivateHeader.jsx';

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  token,
}) {
  return (
    <Aside.Provider>
      {token ? <PrivateHeader /> : <Header />}
      <main>{children}</main>
    </Aside.Provider>
  );
}
