import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';

export function PageLayout({
                             cart,
                             children = null,
                             footer,
                             header,
                             isLoggedIn,
                             publicStoreDomain,
                           }) {
  return (
    <Aside.Provider>
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

