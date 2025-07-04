import CustomSelect from '~/components/CustomSelect.jsx';
import Card from '~/components/Card.jsx';
import ButtonComponent from '~/components/Button.jsx';
import {useState} from 'react';
import {Link, useFetcher, useLoaderData} from '@remix-run/react';
import RegistryChecklist from '~/components/RegistryChecklist';
import {json, redirect} from '@shopify/remix-oxygen';
import FooterBottom from '~/components/FooterBottom';
import NotificationCard from '~/components/NotificationCard';
import RegistryStatusCard from '~/components/RegistryStatusCard';
import { Footer } from '~/components/Footer';

export async function loader(args) {
  const {context, request} = args;

  try {
    const user = await context?.session?.get('@User');
    if (!user?.user?.id) {
      throw new Error('User ID not found in session');
    }

    const registriesResponse = await context.ClientGet(
      `registries/by-userId/${user.user.id}`,
      context,
    );

    if (!registriesResponse?.data) {
      throw new Error('Invalid API response structure');
    }

    const registries = registriesResponse.data.map((registry) => ({
      ...registry,
      value: registry.name,
      label: registry.name
    }));

    const registry = registries.find((registry) => registry.isSelected);
    
    if (!registry) {
      throw new Error('No selected registry found');
    }

    const detailResponse = await context.ClientGet(
      `registries/detail/${registry.id}`,
      context,
    );

    context.session.set('@Registry', {
      ...registry,
      ...detailResponse.data,
    });
    await context.session.commit();

    return json(
      {
        registries,
        registry: {...registry, ...detailResponse.data},
        user,
      },
      {
        headers: {
          'Set-Cookie': await context.session.commit(),
        },
      }
    );
    
  } catch (e) {
    return {
      error: true,
      message: e.message,
      registries: [],
      registry: null
    };
  }
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;

  try {
    await context.ClientPut(
      payload,
      `registries/selected/${payload.id}`,
      context,
    );

    return redirect('/dashboard');
  } catch (e) {
    return {...e};
  }
}

const index = () => {
  const {registries, registry, user} = useLoaderData();

  const fetcher = useFetcher();

  const [selected, setSelected] = useState(registry);

  const eventDateStr = registry?.events?.eventDate;
  let daysLeft = '...';
  if (eventDateStr) {
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    const timeDifference = eventDate.getTime() - today.getTime();
    if (timeDifference < 0) {
      daysLeft = 0;
    } else {
      daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));
    }
  }

  const cardData = [
    {
      value: ` ${registry?.giftAvailable || 0}`,
      label: 'Gifts Available',
      selectable: true,
    },
    {
      value: `${registry?.giftsPurchased || 0}`,
      label: 'Gifts Purchased',
      selectable: false,
    },
    {
      value: `$ ${registry?.registryFundBalance || 0}`,
      label: 'Registry Fund Balance',
      selectable: false,
    },
  ];

  const REGISTRY_CARDS = [
    {
      id: 'add-gifts',
      title: 'ADD GIFTS',
      description:
        "Based on the number of people attending your wedding, we recommend you add at least 95 gifts. When over 25% of your gifts are purchased, we'll advise you to consider adding more.",
      value: registry?.giftAvailable || 0,
      total: '95',
      label: 'GIFTS ADDED',
      showIcon: true,
      buttonText: 'ADD GIFTS',
      link: '/dashboard/addgifts',
    },
    {
      id: 'account',
      title: 'ACCOUNT',
      description:
        'Gifts convert to cash, giving you the flexibility to finalize your registry after the wedding.',
      value: registry?.registryFundBalance || 0,
      label: 'CASH AVAILABLE',
      showIcon: true,
    },
    {
      id: 'gifts-purchased',
      title: 'GIFTS PURCHASED',
      description:
        "Gifts have started to arrive. Click to see what's been purchased.",
      value: registry?.giftsPurchased || 0,
      total: registry?.giftAvailable || 0,
      label: 'GIFTS PURCHASED',
      showIcon: true,
      buttonText: 'VIEW GIFTS',
      link: '/dashboard/gifttracker',
    },
  ];

  const handleToggleChange = (id) => {
    const payload = {
      id,
      previousId: selected.id,
    };
    fetcher.submit(
      {payload},
      {
        method: 'put',
        encType: 'application/json',
      },
    );
  };
  return (
    <>
    <div className="pt-[80px]">
      <div className="flex xl:flex-nowrap flex-wrap gap-4 flex-shrink-0 pb-16">
        <div className="w-full xl:w-9/12 flex flex-col gap-y-4 items-center pb-8">
          <div className="w-64 h-32 bg-gray-500"></div>

          <h2 className="md:text-[42px] text-center xl:mt-0 mt-16 font-normal ivyora">
            welcome to the heart of your wedding,
            <span className="font-italic block">{user?.user.firstName} & {user?.user.fianceFirstName}</span>
          </h2>

          <p className="text-lg font-bold prata">{registry?.events?.eventDate}</p>

          <img
            src="/assets/Images/dashboard-bdr.png"
            alt="Hamburger"
            className="w-auto h-auto mx-auto -mt-2"
          />
          <p className="text-xl font-normal text-center mt-2">
            YOU HAVE &nbsp;
            <span className="font-bold prata text-2xl">{daysLeft} </span> DAYS &nbsp;
            UNTIL THE WEDDING!
          </p>
        </div>
        <div className="w-full xl:w-3/12 flex flex-col gap-y-4">
          <div>
            <NotificationCard />
          </div>
          <div>
            <RegistryStatusCard status={registry?.status} registryId={registry?.id} token={user?.accessToken}/>
          </div>
        </div>
      </div>

      <div className="grid xl:gap-y-0 gap-y-24 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 w-full mt-16 xl:px-12 px-6 pb-[100px]">
        {REGISTRY_CARDS.map((card) => (
          <div
            key={card.id}
            className="bg-[#446184] text-white pb-6 px-[50px] max-h-[700px] flex flex-col items-center"
          >
            {card.showIcon && (
              <div className="flex bg-[#F6F5ED] rounded-full -mt-20 mb-6 w-28 h-28 items-center justify-center">
                <img
                  src="/assets/Images/gift-icon.png"
                  alt="Gift Icon"
                  className="w-16 h-16 mb-4"
                />
              </div>
            )}
            <h3 className="text-lg font-semibold mb-4 mt-[50px]">
              {card.title}
            </h3>
            <p className="text-lg min-h-[240px]  text-center mb-6">
              {card.description}
            </p>
            <div className="text-5xl mt-5 prata flex items-baseline">
              <span>{card.value}</span>
              {card.total && (
                <span className="ml-1 text-4xl">
                  /<span className="text-3xl">{card.total}</span>
                </span>
              )}
            </div>
            <p className="text-sm mt-2">{card.label}</p>
            {card.buttonText && (
              <Link to={card.link}>
              <button className="bg-[#F6F5ED] font-bold text-black px-14 py-3 mt-4 text-base">
                {card.buttonText}
              </button>
              </Link>
            )}
          </div>
        ))}
      </div>

      <Footer />
      </div>
          {/* <RegistryChecklist registry={registry} /> */}
    </>
  );
};

export default index;
