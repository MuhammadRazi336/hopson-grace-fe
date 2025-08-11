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

    console.log('User found:', user.user.id);

    const registriesResponse = await context.ClientGet(
      `registries/by-userId/${user.user.id}`,
      context,
    );

    console.log('Registries response:', registriesResponse);

    if (!registriesResponse?.data) {
      throw new Error('Invalid API response structure');
    }

    const registries = registriesResponse.data.map((registry) => ({
      ...registry,
      value: registry.name,
      label: registry.name
    }));

    console.log('Processed registries:', registries);

    const registry = registries.find((registry) => registry.isSelected);
    
    console.log('Selected registry:', registry);
    
    if (!registry) {
      throw new Error('No selected registry found');
    }

    const detailResponse = await context.ClientGet(
      `registries/detail/${registry.id}`,
      context,
    );

    console.log('Detail response:', detailResponse);

    context.session.set('@Registry', {
      ...registry,
      ...detailResponse.data,
    });
    await context.session.commit();

    const finalRegistry = {...registry, ...detailResponse.data};
    console.log('Final registry object:', finalRegistry);

    return json(
      {
        registries,
        registry: finalRegistry,
        user,
      },
      {
        headers: {
          'Set-Cookie': await context.session.commit(),
        },
      }
    );
    
  } catch (e) {
    console.error('Loader error:', e);
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
  const loaderData = useLoaderData();
  console.log('Full loader data:', loaderData);
  
  const {registries, registry, user} = loaderData;

  console.log('Registry from loader:', registry);
  console.log('Registry type:', typeof registry);
  console.log('Registry keys:', registry ? Object.keys(registry) : 'null');

  const fetcher = useFetcher();

  const [selected, setSelected] = useState(registry);

  // Handle case where registry is null
  if (!registry) {
    return (
      <div className="pt-[80px] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Registry Not Found</h2>
          <p className="text-gray-600">Unable to load registry data. Please try refreshing the page.</p>
          {loaderData.error && (
            <p className="text-red-500 mt-2">Error: {loaderData.message}</p>
          )}
        </div>
      </div>
    );
  }

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

  // const cardData = [
  //   {
  //     value: ` ${registry?.giftAvailable || 0}`,
  //     label: 'Gifts Available',
  //     selectable: true,
  //   },
  //   {
  //     value: `${registry?.giftsPurchased || 0}`,
  //     label: 'Gifts Purchased',
  //     selectable: false,
  //   },
  //   {
  //     value: `$ ${registry?.registryFundBalance || 0}`,
  //     label: 'Registry Fund Balance',
  //     selectable: false,
  //   },
  //   {
  //     value: `$ ${registry?.giftBalance || 0}`,
  //     label: 'Gift Balance',
  //     selectable: false,
  //   },
  // ];

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
      icon: '/assets/Images/WORLDSBESTBRANDS.png',
      buttonText: 'ADD GIFTS',
      link: '/dashboard/addgifts',
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
      icon: '/assets/Images/GIFTPURCHASED.png',
      buttonText: 'VIEW PURCHASES',
      link: '/dashboard/gifttracker',
    },
    {
      id: 'funds',
      title: 'CASH & TRAVEL FUNDS',
      description:
        'Gifts convert to cash, giving you the flexibility to finalize your registry after the wedding.',
      value: registry?.registryFundBalance || 0,
      label: 'FUNDS ADDED',
      showIcon: true,
      icon: '/assets/Images/BESPOKETRAVEL.png',
      buttonText: 'ADD FUNDS',
      link: '/dashboard/cashfunds',
    },
    {
      id: 'gift-balance',
      title: 'GIFT BALANCE',
      description: 'Gifts convert to cash, giving you the flexibility to finalize your registry after the wedding.',
      value: registry?.giftBalance || 0,
      label: 'GIFT BALANCE',
      showIcon: true,
      icon: '/assets/Images/CASHTRAVEL.png',
      buttonText: 'VIEW FUNDS',
      link: '/dashboard/cashfunds',
    }
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
          <div className="w-64 h-32 bg-gray-300 flex items-center justify-center">
            <h2 className="flex justify-center items-center font-normal text-center">FPO - 
              <br />
              GIF/ILLUSTRATION
            </h2>
          </div>

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

      <div className="grid xl:gap-y-[150px] gap-y-24 xl:grid-cols-2 md:grid-cols-1 grid-cols-1 w-full mt-[100px] xl:px-12 px-6 pb-[100px]">
        {REGISTRY_CARDS.map((card) => (
          <div
            key={card.id}
            className="bg-[#446184] text-white pb-6 px-[50px] mx-[100px] max-h-[800px] flex flex-col items-center"
          >
             {card.showIcon && (
              <div className='flex bg-[#F6F5ED] rounded-full -mt-24 mb-6 w-40 h-40 items-center justify-center'>
                <img
                  src={card.icon}
                  alt="Gift Icon"
                  className="w-24 h-24 mb-4"
                />
              </div>
             )}
            <h3 className="text-3xl font-semibold mb-16 mt-[50px]">
              {card.title}
            </h3>
            <p className="text-2xl min-h-[240px]  text-center mb-6">
              {card.description}
            </p>
            <div className="text-5xl prata flex items-baseline">
              {card.id === 'funds' && (
                <span className="text-7xl mr-1 self-start">$</span>
              )}
              <span className="text-7xl">{card.value}</span>
              {card.total && (
                <span className="ml-1 text-6xl">
                  /<span className="text-4xl">{card.total}</span>
                </span>
              )}
            </div>
            <p className="text-sm mt-2">{card.label}</p>
            {card.buttonText && (
              <Link to={card.link}>
              <button className="bg-[#F6F5ED] font-bold text-black px-14 py-4 mt-10 mb-10 text-base">
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
