import CustomSelect from '~/components/CustomSelect.jsx';
import Card from '~/components/Card.jsx';
import ButtonComponent from '~/components/Button.jsx';
import {useState} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import RegistryChecklist from '~/components/RegistryChecklist';
import {json, redirect} from '@shopify/remix-oxygen';

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
  // const action = useActionData();

  const fetcher = useFetcher();

  const [selected, setSelected] = useState(registry);

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
    <div>
      <div className="flex gap-8">
        <div className="flex flex-col gap-4 flex-2">
          <div>
            <CustomSelect
              label="Registry Collection:"
              selected={selected}
              setSelected={(e) => {
                setSelected(e);
                handleToggleChange(e.id);
              }}
              options={registries}
            />
          </div>
          <div>
            <h2>Gift Tracker</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cardData.map((card, index) => (
                <div
                  key={index}
                  className={`${
                    index === cardData.length - 1 && cardData.length % 2 !== 0
                      ? 'col-span-full' // Make the last card take full width if odd
                      : ''
                  }`}
                >
                  <Card
                    key={index}
                    value={card.value}
                    label={card.label}
                    selectable={card.selectable}
                    onCardSelect={(isSelected) =>
                      handleCardSelect(isSelected, index)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <RegistryChecklist registry={registry} />
        </div>
        <div className="flex flex-col gap-4 flex-2">
          <div>
            <h1 className="text-xl font-bold mb-2">Notifications</h1>
            <div className=" p-4 rounded-md flex">
              <div className="flex-1 border rounded-md p-4 mr-4 bg-gray-300">
                {/* Empty card */}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-lg font-normal my-5">
                  Want to see how your registry appears to your guests?
                </h2>
                <p className="mt-2 text-center my-5">Preview as a guest</p>
                <ButtonComponent
                  className="mt-5 w-1/1.3"
                  text="Preview Registry"
                />
              </div>
            </div>
          </div>
          <div>
            <div>
              <h1 className="text-xl font-bold mb-2">Your Registry Advisor</h1>
              <div className=" p-4 rounded-md flex">
                <div className="flex-1 border rounded-md p-4 mr-4 bg-gray-300">
                  {/* Empty card */}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-lg font-semibold">Jocelyn Robinson</h2>
                  <h3 className="font-normal">
                    jocelyn@registry.com | 403-123-4567
                  </h3>
                  <p className="mt-5 mb-3">
                    Hi! I'm your registry advisor. I'm here to help you through
                    the process.
                  </p>
                  <ButtonComponent
                    className="mt-5 w-1/1.3"
                    text="Contact Your Advisor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
