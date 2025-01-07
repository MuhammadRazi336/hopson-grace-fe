// import { Link } from "remix";
import {Outlet} from '@remix-run/react';
import CustomTabs from '~/components/Tabs.jsx';

const Dashboard_index = () => {
  const tabData = [
    {
      label: 'Registry Detail',
      value: 1,
      route: '',
    },
    {
      label: 'Profile',
      value: 2,
      route: 'profile',
    },
    {
      label: 'Registry',
      value: 3,
      route: 'registry',
    },
    {
      label: 'Add or Edit Gifts',
      value: 4,
      route: 'addgifts',
    },
    {
      label: 'Add Cash Funds',
      value: 5,
      route: 'cashfunds',
    },
    {
      label: 'Gifts & Thank You Tracker',
      value: 6,
      route: 'giftsthanks',
    },
    {
      label: 'Ship My Gifts',
      value: 7,
      route: 'shipgifts',
    },
    {
      label: 'Contact My Advisor',
      value: 8,
      route: 'contactadvisor',
    },
  ];

  return (
    <div>
      <div>
        <CustomTabs
          tabsData={tabData}
          defaultActive={1}
          headerClassName="bg-gray-100 rounded-md"
        />
      </div>
      <div className={'p-4'}>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard_index;
