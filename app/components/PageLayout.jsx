import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {PrivateHeader} from '~/components/PrivateHeader.jsx';
import LiveChat from '~/components/LiveChat';

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
      {token ? <PrivateHeader /> : ""}
      <main>{children}</main>
      
      {/* Live chat - Fixed position on bottom right throughout the site */}
      <div className="fixed bottom-0 right-0 z-[1000]">
        <LiveChat 
          showTitle={false}
          showDescription={false}
        />
      </div>
    </Aside.Provider>
  );
}
