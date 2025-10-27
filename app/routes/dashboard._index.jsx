import CustomSelect from '~/components/CustomSelect.jsx';
import Card from '~/components/Card.jsx';
import ButtonComponent from '~/components/Button.jsx';
import {useState, useEffect} from 'react';
import {Link, useFetcher, useLoaderData, useNavigate, Form} from '@remix-run/react';
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
    
    // Handle new minimal session structure
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

    // Debug: Log the exact structure
    // Handle different possible data structures
    let registriesData = registriesResponse.data;
    
    // If data is not an array, check if it's nested
    if (!Array.isArray(registriesData)) {
      // Check if data has a nested array property
      if (registriesData && typeof registriesData === 'object') {
        // Look for common nested array properties
        const possibleArrayProps = ['registries', 'items', 'list', 'data'];
        for (const prop of possibleArrayProps) {
          if (Array.isArray(registriesData[prop])) {
            registriesData = registriesData[prop];
            break;
          }
        }
      }
      
      // If still not an array, throw error
      if (!Array.isArray(registriesData)) {
        throw new Error('Registries data is not an array');
      }
    }

    const registries = registriesData.map((registry) => ({
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

    const finalRegistry = {...registry, ...detailResponse.data};

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
  
  const {registries, registry, user} = loaderData;

  const fetcher = useFetcher();

  const [selected, setSelected] = useState(registry);
  
  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const apiBaseUrl = 'https://dev-hopsongrace.codup.io';

  // Fetch notifications function
  const fetchNotifications = async (isRefresh = false) => {
    if (!user?.user?.id) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const token = localStorage.getItem('@Token') || localStorage.getItem('@token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiBaseUrl}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.code === 200 && result.data && Array.isArray(result.data)) {
          setNotifications(result.data);
          const unreadNotifications = result.data.filter(n => n.status === 'unread');
          setUnreadCount(unreadNotifications.length);
          console.log(`Notifications refreshed. Unread count: ${unreadNotifications.length}`);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [user?.user?.id]);

  // Set up polling to check for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.user?.id) return;

    const interval = setInterval(() => {
      console.log('Polling for new notifications...');
      fetchNotifications();
    }, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [user?.user?.id]);

  // Handle notification card click
  const handleNotificationView = () => {
    // Refresh notifications when user clicks view
    console.log('View notifications clicked - refreshing notifications...');
    fetchNotifications(true); // Pass true to indicate this is a refresh
    // You can navigate to a notifications page or show a modal here
  };

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
        `Based on the number of people attending your wedding, we recommend you add at least ${Math.ceil(registry?.events?.noOfGuest * 1.5)} gifts. When over 85% of your gifts are purchased, we'll advise you to consider adding more.`,
      value: registry?.giftAvailable || 0,
      total: Math.ceil(registry?.events?.noOfGuest * 1.5),
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
      total: registry?.giftAvailable || '',
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
    <div className="pt-[80px] lg:pt-[2.917vw] xl:pt-[2.917vw] 2xl:pt-[2.917vw] max-[1024px]:py-[50px] max-[1024px]:px-[20px]">
      <div className="flex lg:flex-nowrap xl:flex-nowrap 2xl:flex-nowrap flex-wrap gap-4 flex-shrink-0 pb-[5.208vw] max-[1024px]:justify-center">
        <div className="w-9/12 lg:w-9/12 xl:w-9/12 2xl:w-9/12 flex flex-col items-center pt-[1vw] pl-[27vw] max-[1024px]:pl-0">
          <div className="w-64 h-32 flex items-center justify-center">
            <img src="/assets/Images/heart.png" alt="" />
          </div>

          <h2 className="md:text-[42px] lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] lg:leading-[3.333vw] xl:leading-[3.333vw] 2xl:leading-[3.333vw] text-center xl:mt-0 mt-16 max-[1024px]:mt-2 font-normal ivyora mb-[48px] max-[1024px]:mb-[20px] lg:mb-[2.5vw] xl:mb-[2.5vw] 2xl:mb-[2.5vw] mt-2 max-[1024px]:!text-[30px]">
            welcome to the heart of your wedding,
            <span className="block uppercase prata">{user?.user.firstName} & {user?.user.fianceFirstName}</span>
          </h2>

          <p className="text-lg font-bold bastardogrotesk mb-[1.406vw] lg:text-[1.563vw] xl:text-[1.563vw] 2xl:text-[1.563vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">{registry?.events?.eventDate}</p>

          <img
            src="/assets/Images/dashboard-bdr.png"
            alt="Hamburger"
            className="w-auto h-auto mx-auto lg:w-[39.219vw] xl:w-[39.219vw] 2xl:w-[39.219vw] mb-[2.083vw]" 
          />
          <p className="text-xl font-normal text-center lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">
            YOU HAVE &nbsp;
            <span className="font-bold prata text-2xl lg:text-[3.021vw] xl:text-[3.021vw] 2xl:text-[3.021vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] relative top-[0.521vw]">{daysLeft} </span> DAYS &nbsp;
            UNTIL THE WEDDING!
          </p>
        </div>
        <div className="w-3/12 lg:w-3/12 xl:w-3/12 2xl:w-3/12 flex flex-col gap-y-4 pr-[4.271vw] max-[1024px]:w-full max-[1024px]:pr-0">
          <div className='flex justify-end'>
            <NotificationCard 
              count={unreadCount} 
              onView={handleNotificationView}
              loading={loading}
              refreshing={refreshing}
            />
          </div>
          <div className='flex justify-end'>
            <RegistryStatusCard status={registry?.status} registryId={registry?.id} token={user?.accessToken}/>
          </div>
        </div>
      </div>

      <div className="grid lg:gap-[3.906vw] xl:gap-[3.906vw] 2xl:gap-[3.906vw] lg:w-[64.323vw] md:!gap-y-[10vw] lg:mx-auto gap-y-30 xl:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-2 max-[1024px]:grid-cols-1 w-full mt-[100px] pb-[11.615vw] max-[1024px]:gap-y-[130px] max-[1024px]:pb-[50px]">
        {REGISTRY_CARDS.map((card) => (
          <div
            key={card.id}
            className="bg-[#446184] text-white pb-[2.5vw] lg:px-[2.865vw] flex flex-col items-center max-[1024px]:p-[20px]"
          >
             {card.showIcon && (
              <div className='flex bg-[#F6F5ED] rounded-full -mt-24 w-40 h-40 lg:w-[11.198vw] xl:w-[11.198vw] 2xl:w-[11.198vw] lg:h-[11.198vw] xl:h-[11.198vw] 2xl:h-[11.198vw] items-center justify-center max-[1024px]:w-[130px] max-[1024px]:h-[130px]'>
                <img
                  src={card.icon}
                  alt="Gift Icon"
                  className="w-24 h-24 lg:w-[8.021vw] lg:h-[8.021vw]"
                />
              </div>
             )}
            <h3 className="text-3xl font-semibold lg:text-[1.25vw] xl:text-[1.25vw] 2xl:text-[1.25vw] lg:leading-[1.25vw] xl:leading-[1.25vw] 2xl:leading-[1.25vw] mb-[1.302vw] mt-[2.656vw] max-[1024px]:!text-[20px]">
              {card.title}
            </h3>
            <p className="text-2xl min-h-[7.031vw] lg:text-[1.146vw] xl:text-[1.146vw] 2xl:text-[1.146vw] lg:leading-[1.667vw] xl:leading-[1.667vw] 2xl:leading-[1.667vw] text-center mb-[2.604vw] max-[1024px]:!text-[16px] max-[1024px]:!leading-[20px] max-[1024px]:px-[20px]">
              {card.description}
            </p>
            <div className="text-5xl prata flex items-baseline">
              {(card.id === 'funds' || card.id === 'gift-balance') && (
                <span className="text-5xl mr-1 self-start lg:text-[3.333vw] xl:text-[3.333vw] 2xl:text-[3.333vw]">$</span>
              )}
              <span className="text-5xl lg:text-[3.333vw] xl:text-[3.333vw] 2xl:text-[3.333vw]">{card.value}</span>
              {card.total && (
                <span className="ml-1 text-6xl lg:text-[1.875vw] xl:text-[1.875vw] 2xl:text-[1.875vw]">
                  /<span className="text-2xl lg:text-[1.875vw] xl:text-[1.875vw] 2xl:text-[1.875vw]">{card.total}</span>
                </span>
              )}
            </div>
            <p className="text-sm mt-2 lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.563vw] xl:leading-[1.563vw] 2xl:leading-[1.563vw]">{card.label}</p>
            {card.buttonText && (
              <Link to={card.link}>
              <button className="bg-[#F6F5ED] lg:w-[15.417vw] xl:w-[15.417vw] 2xl:w-[15.417vw] lg:h-[4.115vw] xl:h-[4.115vw] 2xl:h-[4.115vw] font-bold text-black px-1 py-1 mt-[2.396vw] text-base lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] cursor-pointer max-[1024px]:w-[200px] max-[1024px]:h-[40px] max-[1024px]:text-[14px]">
                {card.buttonText}
              </button>
              </Link>
            )}
          </div>
        ))}
      </div>
      </div>
      <Footer />
          {/* <RegistryChecklist registry={registry} /> */}
    </>
  );
};

export default index;
